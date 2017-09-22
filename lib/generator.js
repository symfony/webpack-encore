/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const inquirer = require('inquirer');
const fs = require('fs');
const childProcess = require('child_process');
const PrettyError = require('pretty-error');

const jsTypeVanilla = 'JS_TYPE_VANILLA';
const jsTypeReact = 'JS_TYPE_REACT';
const jsTypeVue = 'JS_TYPE_VUE';

const cssTypeCss = 'CSS_TYPE_CSS';
const cssTypeSass = 'CSS_TYPE_SASS';
const cssTypeLess = 'CSS_TYPE_LESS';

const jsPackages = {
    [jsTypeVanilla]: {
        dependencies: ['jquery']
    },
    [jsTypeReact]: {
        devDependencies: ['babel-preset-react'],
        dependencies: ['react']
    },
    [jsTypeVue]: {
        devDependencies: ['vue-loader', 'vue-template-compiler'],
        dependencies: ['vue']
    }
};

const cssPackages = {
    [cssTypeCss]: {
        devDependencies: ['postcss-loader', 'autoprefixer']
    },
    [cssTypeSass]: {
        devDependencies: ['postcss-loader', 'autoprefixer', 'sass-loader', 'node-sass']
    },
    [cssTypeLess]: {
        devDependencies: ['postcss-loader', 'autoprefixer', 'less-loader', 'less']
    }
};

function writeFile(path, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, (writeError) => {
            if (writeError) {
                return reject(writeError);
            }

            resolve();
        });
    });
}

function writeFileSafe(path, content) {
    return new Promise((resolve, reject) => {
        fs.stat('postcss.config.js', (err) => {
            if (!err) {
                inquirer.prompt({
                    type: 'confirm',
                    name: 'overwriteFile',
                    message: `The file "${path}" already exists, do you want to overwrite it?`,
                    default: false
                }).then((answers) => {
                    if (!answers.overwriteFile) {
                        // Don't overwrite the current file and keep going
                        return resolve();
                    }

                    writeFile(path, content).then(resolve, reject);
                });
            } else {
                writeFile(path, content).then(resolve, reject);
            }
        });
    });
}

function askIsSPA() {
    const spaType = 'TYPE_SPA';
    const multiType = 'TYPE_MULTI';

    return inquirer.prompt({
        type: 'list',
        message: 'What type of app are you creating?',
        name: 'appType',
        choices: [
            {
                name: 'A) Single Page Application (SPA)',
                value: spaType
            },
            {
                name: 'B) Traditional multi-page app',
                value: multiType
            }
        ]
    }).then((response) => {
        return response.appType === spaType;
    });
}

function askJavaScriptType() {
    return inquirer.prompt({
        type: 'list',
        message: 'What type of JavaScript app do you want?',
        name: 'jsType',
        choices: [
            {
                name: 'A) Vanilla JavaScript',
                value: jsTypeVanilla
            },
            {
                name: 'B) React',
                value: jsTypeReact
            },
            {
                name: 'C) Vue.js',
                value: jsTypeVue
            }
        ]
    }).then((response) => {
        return response.jsType;
    });
}

function askCssType() {
    return inquirer.prompt({
        type: 'list',
        message: 'What type of CSS do you like?',
        name: 'cssType',
        choices: [
            {
                name: 'A) Sass',
                value: cssTypeSass
            },
            {
                name: 'B) LESS',
                value: cssTypeLess
            },
            {
                name: 'C) Vanilla CSS',
                value: cssTypeCss
            }
        ]
    }).then((response) => {
        return response.cssType;
    });
}

function createWebpackConfig(appConfig) {
    // TODO Ask the user for the output and public paths
    const outputPath = 'build/';
    const publicPath = '/';

    let webpackConfig = `// webpack.config.js
const Encore = require('@symfony/webpack-encore');

Encore
  // directory where all compiled assets will be stored
  .setOutputPath('${outputPath}')

  // what's the public path to this directory (relative to your project's document root dir)
  .setPublicPath('${publicPath}')

  // empty the outputPath dir before each build
  .cleanupOutputBeforeBuild()

  // enable support for PostCSS (https://github.com/postcss/postcss)
  .enablePostCssLoader()
`;

    // Add loader/preset based on the selected JS app type
    if (appConfig.jsType === jsTypeReact) {
        webpackConfig += `
  // enable React preset in order to support JSX
  .enableReactPreset()
`;
    }

    if (appConfig.jsType === jsTypeVue) {
        webpackConfig += `
  // enable Vue.js loader
  .enableVueLoader()
`;
    }

    // Add loader based on the selected CSS language
    if (appConfig.cssType === cssTypeSass) {
        webpackConfig += `
  // enable support for Sass stylesheets
  .enableSassLoader()
`;
    }

    if (appConfig.cssType === cssTypeLess) {
        webpackConfig += `
  // enable support for Less stylesheets
  .enableLessLoader()
`;
    }

    webpackConfig += `;

// export the final configuration
module.exports = Encore.getWebpackConfig();
`;

    return writeFileSafe('webpack.config.js', webpackConfig);
}

function addMissingDependencies(dependencies = [], dev = false) {
    return new Promise((resolve, reject) => {
        // Try to resolve each dependency to see if it's already
        // installed.
        const missingDependencies = dependencies.filter((dependency) => {
            try {
                require.resolve(dependency);
            } catch (e) {
                return true;
            }
        });

        if (!missingDependencies.length) {
            // No missing dependency, keep going
            return resolve();
        }

        // Add all missing dependencies using yarn
        const yarnArgs = ['add'];

        if (dev) {
            yarnArgs.push('--dev');
        }

        yarnArgs.push(...missingDependencies);

        const process = childProcess.spawn('yarn', yarnArgs, { stdio: 'inherit' });
        process.on('close', (code) => {
            if (code !== 0) {
                return reject(`Yarn exited with code ${code}`);
            }

            resolve();
        });
    });
}

function addDependencies(appConfig) {
    const devDependencies = new Set();
    const dependencies = new Set();

    // Retrieve dependencies related to the selected js app type
    if (jsPackages[appConfig.jsType]) {
        if (jsPackages[appConfig.jsType].devDependencies) {
            jsPackages[appConfig.jsType].devDependencies.forEach((dependency) => {
                devDependencies.add(dependency);
            });
        }

        if (jsPackages[appConfig.jsType].dependencies) {
            jsPackages[appConfig.jsType].dependencies.forEach((dependency) => {
                dependencies.add(dependency);
            });
        }
    }

    // Retrieve dependencies related to the selected css language
    if (cssPackages[appConfig.cssType]) {
        if (cssPackages[appConfig.cssType].devDependencies) {
            cssPackages[appConfig.cssType].devDependencies.forEach((dependency) => {
                devDependencies.add(dependency);
            });
        }

        if (cssPackages[appConfig.cssType].dependencies) {
            cssPackages[appConfig.cssType].dependencies.forEach((dependency) => {
                dependencies.add(dependency);
            });
        }
    }

    return addMissingDependencies([...devDependencies], true)
        .then(() => addMissingDependencies([...dependencies], false));
}

function addScripts() {
    return new Promise((resolve, reject) => {
        fs.readFile('package.json', (readError, data) => {
            if (readError) {
                return reject(readError);
            }

            try {
                const packageContent = JSON.parse(data);

                if (!packageContent.scripts) {
                    packageContent.scripts = {};
                }

                packageContent.scripts['encore:dev'] = 'yarn run encore dev';
                packageContent.scripts['encore:watch'] = 'yarn run encore dev-server';
                packageContent.scripts['encore:production'] = 'yarn run encore production';

                // Write updated package.json content
                writeFile('package.json', JSON.stringify(packageContent, null, 2)).then(resolve, reject);
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
}

function createPostCssConfig() {
    const postCssConfig = `// postcss.config.js
module.exports = {
  plugins: {
    'autoprefixer': {},
  }
};
`;

    return writeFileSafe('postcss.config.js', postCssConfig);
}

function generateApp(appConfig) {
    /*
     * Tasks:
     *      A) Create the webpack.config.js file with some
     *          varied options based on their choices
     *              (fail early if this file exists?)
     *      B) yarn add XXX --dev all the packages they will need
     *      C) Add "scripts" to their package.json file
     *          encore:dev
     *          encore:watch
     *          encore:production
     *      D) Add .postcss config file
     *      E) Add node_modules to .gitignore (if that file exists)
     *      F) Generate a mini-app, which will be vanilla JS,
     *          React or Vue.js depending on their choice. This
     *          would be their one entry
     *      G) Give them a message about what to do next
     *
     */

    createWebpackConfig(appConfig)
        .then(() => addDependencies(appConfig))
        .then(() => addScripts())
        .then(() => createPostCssConfig())
        .then(() => console.log('Success!'))
        .catch((error) => {
            const pe = new PrettyError();
            console.log(pe.render(error));
        });
}

function isYarnAvailable() {
    try {
        childProcess.execSync('yarnpkg --version', { stdio: 'ignore' });
    } catch (e) {
        return false;
    }

    return true;
}

function runInit() {
    const appConfig = {
        isSpa: null,
        jsType: null,
        cssType: null
    };

    if (!isYarnAvailable()) {
        throw new Error('Yarn is required to run the init command: https://yarnpkg.com/lang/en/docs/install/');
    }

    askIsSPA().then(isSpa => {
        appConfig.isSpa = isSpa;
        if (isSpa) {
            askJavaScriptType().then(jsType => {
                appConfig.jsType = jsType;

                askCssType().then(cssType => {
                    appConfig.cssType = cssType;

                    generateApp(appConfig);
                });
            });
        } else {
            // for multi-page apps, the main shared entry
            // will always be vanilla JS
            appConfig.jsType = jsTypeVanilla;

            askCssType().then(cssType => {
                appConfig.cssType = cssType;

                generateApp(appConfig);
            });
        }
    });
}

module.exports = function(runtimeConfig) {
    switch (runtimeConfig.command) {
        case 'init':
            runInit();
            break;
        default:
            throw new Error(`Unknown generator command ${runtimeConfig.command}.`);
    }
};

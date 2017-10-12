/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const InitConfig = require('./InitConfig');
const fs = require('fs');
const PrettyError = require('pretty-error');
const inquirer = require('inquirer');
const childProcess = require('child_process');

const jsPackages = {
    [InitConfig.jsTypeVanilla]: {
        dependencies: ['jquery']
    },
    [InitConfig.jsTypeReact]: {
        devDependencies: ['babel-preset-react'],
        dependencies: ['react']
    },
    [InitConfig.jsTypeVue]: {
        devDependencies: ['vue-loader', 'vue-template-compiler'],
        dependencies: ['vue']
    }
};

const cssPackages = {
    [InitConfig.cssTypeCss]: {
        devDependencies: ['postcss-loader', 'autoprefixer']
    },
    [InitConfig.cssTypeSass]: {
        devDependencies: ['postcss-loader', 'autoprefixer', 'sass-loader', 'node-sass']
    },
    [InitConfig.cssTypeLess]: {
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
    if (appConfig.jsType === InitConfig.jsTypeReact) {
        webpackConfig += `
  // enable React preset in order to support JSX
  .enableReactPreset()
`;
    }

    if (appConfig.jsType === InitConfig.jsTypeVue) {
        webpackConfig += `
  // enable Vue.js loader
  .enableVueLoader()
`;
    }

    // Add loader based on the selected CSS language
    if (appConfig.cssType === InitConfig.cssTypeSass) {
        webpackConfig += `
  // enable support for Sass stylesheets
  .enableSassLoader()
`;
    }

    if (appConfig.cssType === InitConfig.cssTypeLess) {
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

function writeFileSafe(path, content) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err) => {
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

module.exports = function(initConfig) {
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

    createWebpackConfig(initConfig)
        .then(() => addDependencies(initConfig))
        .then(() => addScripts())
        .then(() => createPostCssConfig())
        .then(() => console.log('Success!'))
        .catch((error) => {
            const pe = new PrettyError();
            console.log(pe.render(error));
        });
};

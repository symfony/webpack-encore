/*
 * This file is part of the Symfony Webpack Encore package.
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
const path = require('path');
const reactProvider = require('./providers/react-provider');
const vanillaProvider = require('./providers/vanilla-provider');
const vueProvider = require('./providers/vue-provider');
const chalk = require('chalk');

class InitGenerator {
    /**
     * @param {InitConfig} initConfig
     */
    constructor(initConfig) {
        this.initConfig = initConfig;
    }

    createWebpackConfig() {
        // TODO Ask the user for the output and public paths
        const outputPath = this.initConfig.outputPath;
        const publicPath = this.initConfig.publicPath;

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

    // show OS notifications when builds finish/fail
    .enableBuildNotifications()

    // uncomment for legacy applications that require $/jQuery as a global variable
    // .autoProvidejQuery()
    `;

        // Add loader/preset based on the selected JS app type
        if (this.initConfig.jsType === InitConfig.jsTypeReact) {
            webpackConfig += `
    // enable React preset in order to support JSX
    .enableReactPreset()
    `;
        }

        if (this.initConfig.jsType === InitConfig.jsTypeVue) {
            webpackConfig += `
    // enable Vue.js loader
    .enableVueLoader()
    `;
        }

        // Add loader based on the selected CSS language
        if (this.initConfig.cssType === InitConfig.cssTypeSass) {
            webpackConfig += `
    // enable support for Sass stylesheets
    .enableSassLoader()
    `;
        }

        if (this.initConfig.cssType === InitConfig.cssTypeLess) {
            webpackConfig += `
    // enable support for Less stylesheets
    .enableLessLoader()
    `;
        }

        webpackConfig += `
;

    // export the final configuration
    module.exports = Encore.getWebpackConfig();
    `;

        return this._writeFileSafe('webpack.config.js', webpackConfig);
    }

    addDependencies(installDeps) {
        // used for testing
        if (!installDeps) {
            return Promise.resolve();
        }

        const devDependencies = new Set();
        devDependencies.add('webpack-notifier');
        const dependencies = new Set();

        // Retrieve dependencies related to the selected js app type
        if (jsPackages[this.initConfig.jsType]) {
            if (jsPackages[this.initConfig.jsType].devDependencies) {
                jsPackages[this.initConfig.jsType].devDependencies.forEach((dependency) => {
                    devDependencies.add(dependency);
                });
            }

            if (jsPackages[this.initConfig.jsType].dependencies) {
                jsPackages[this.initConfig.jsType].dependencies.forEach((dependency) => {
                    dependencies.add(dependency);
                });
            }
        }

        // Retrieve dependencies related to the selected css language
        if (cssPackages[this.initConfig.cssType]) {
            if (cssPackages[this.initConfig.cssType].devDependencies) {
                cssPackages[this.initConfig.cssType].devDependencies.forEach((dependency) => {
                    devDependencies.add(dependency);
                });
            }

            if (cssPackages[this.initConfig.cssType].dependencies) {
                cssPackages[this.initConfig.cssType].dependencies.forEach((dependency) => {
                    dependencies.add(dependency);
                });
            }
        }

        return this.addMissingDependencies([...devDependencies], true)
            .then(() => this.addMissingDependencies([...dependencies], false));
    }

    addMissingDependencies(dependencies = [], dev = false) {
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
            const yarnArgs = ['add', '--cwd', this.initConfig.projectPath];

            if (dev) {
                yarnArgs.push('--dev');
            }

            yarnArgs.push(...missingDependencies);

            const yarnProcess = childProcess.spawn('yarn', yarnArgs, {
                stdio: 'inherit'
            });
            yarnProcess.on('close', (code) => {
                if (code !== 0) {
                    return reject(`Yarn exited with code ${code}`);
                }

                resolve();
            });
        });
    }

    addPackageJsonScripts() {
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
                    this._writeFileSafe('package.json', JSON.stringify(packageContent, null, 2)).then(resolve, reject);
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    createPostCssConfig() {
        const postCssConfig = `// postcss.config.js
module.exports = {
  plugins: {
    'autoprefixer': {},
  }
};
    `;

        return this._writeFileSafe('postcss.config.js', postCssConfig);
    }

    createApp() {
        const providers = {
            [InitConfig.jsTypeVanilla]: vanillaProvider,
            [InitConfig.jsTypeReact]: reactProvider,
            [InitConfig.jsTypeVue]: vueProvider
        };

        if (typeof providers[this.initConfig.jsType] !== 'function') {
            throw new Error(`Could not find a valid provider for type "${this.initConfig.jsType}"`);
        }

        return providers[this.initConfig.jsType](this.initConfig);
    }

    _writeFile(filename, content) {
        const fullPath = path.join(this.initConfig.projectPath, filename);
        const fileExists = fs.existsSync(fullPath);

        return new Promise((resolve, reject) => {
            fs.writeFile(fullPath, content, (writeError) => {
                if (writeError) {
                    return reject(writeError);
                }

                console.log(`${chalk.green(fileExists ? 'updated' : 'created')} ${filename}`);
                resolve();
            });
        });
    }

    _writeFileSafe(filename, content) {
        const fullPath = path.join(this.initConfig.projectPath, filename);

        return new Promise((resolve, reject) => {
            fs.stat(fullPath, (err) => {
                if (!err) {
                    inquirer.prompt({
                        type: 'confirm',
                        name: 'overwriteFile',
                        message: `The file "${filename}" already exists, do you want to overwrite it?`,
                        default: false
                    }).then((answers) => {
                        if (!answers.overwriteFile) {
                            // Don't overwrite the current file and keep going
                            return resolve();
                        }

                        this._writeFile(filename, content).then(resolve, reject);
                    });
                } else {
                    this._writeFile(filename, content).then(resolve, reject);
                }
            });
        });
    }
}

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

module.exports = function(initConfig, options) {
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
     *      G) Give them a message about what to do next, which
     *
     *      TODO: in the future: automatically start an add:entry
     *      command.
     *
     */

    const generator = new InitGenerator(initConfig);

    options = Object.assign({
        installDeps: true
    }, options);

    return generator.createWebpackConfig()
        .then(() => generator.addDependencies(options.installDeps))
        .then(() => generator.addPackageJsonScripts())
        .then(() => generator.createPostCssConfig())
        // todo: removed temporarily, will be re-added to an add:entry command
        //.then(() => generator.createApp())
        .then(() => console.log('Success!'))
        .catch((error) => {
            const pe = new PrettyError();
            console.log(pe.render(error));
        });
};

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
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const reactProvider = require('./providers/react-provider');
const vanillaProvider = require('./providers/vanilla-provider');
const vueProvider = require('./providers/vue-provider');
const ProviderConfig = require('./providers/provider-config');

class InitGenerator {
    /**
     * @param {InitConfig} initConfig
     */
    constructor(initConfig) {
        this.initConfig = initConfig;
    }

    createWebpackConfig(jsEntryPath, jsActivationMethod) {
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
`;

        if (this.initConfig.isSpa) {
            webpackConfig += `
    // main application "entry" file
    .addEntry('app', './${jsEntryPath}')
`;
        } else {
            webpackConfig += `
    // JS & CSS that's needed on every page (or that is used on many
    // pages, and should be packaged here for better performance)
    .createSharedEntry('app', './assets/app.js')
`;
        }

        webpackConfig += `
    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()

    // enable support for PostCSS (https://github.com/postcss/postcss)
    .enablePostCssLoader()

    // show OS notifications when builds finish/fail
    .enableBuildNotifications()

    // uncomment for legacy applications that require $/jQuery as a global variable
    // .autoProvidejQuery()
    `;

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

        if (jsActivationMethod) {
            webpackConfig += `
    .${jsActivationMethod}
    `;
        }

        webpackConfig += `
;

    // export the final configuration
    module.exports = Encore.getWebpackConfig();
    `;

        return this._writeFileSafe('webpack.config.js', webpackConfig);
    }

    /**
     * Guarantees that a package.json file exists.
     *
     * @return {Promise<any>}
     */
    createPackageJsonFile() {
        return new Promise((resolve, reject) => {
            const packageJsonPath = path.join(this.initConfig.projectPath, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                resolve();

                return;
            }

            this._writeFile('package.json', JSON.stringify({}, null, 2)).then(resolve, reject);
        });
    }

    addDependencies(installDeps, jsDependencies) {
        // used for testing
        if (!installDeps) {
            return Promise.resolve();
        }

        const devDependencies = new Set();
        devDependencies.add('webpack-notifier');

        jsDependencies.forEach(dep => {
            devDependencies.add(dep);
        });

        const dependencies = new Set();

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
            if (dependencies.length === 0) {
                resolve();

                return;
            }

            // Add all missing dependencies using yarn
            const yarnArgs = ['add'];

            if (dev) {
                yarnArgs.push('--dev');
            }

            yarnArgs.push(...dependencies);

            const yarnProcess = childProcess.spawn('yarn', yarnArgs, {
                stdio: 'inherit',
                cwd: this.initConfig.projectPath
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
            const packageJsonPath = path.join(this.initConfig.projectPath, 'package.json');

            fs.readFile(packageJsonPath, (readError, data) => {
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

                    // purposely not using "safe": we're safely updating
                    this._writeFile('package.json', JSON.stringify(packageContent, null, 2)).then(resolve, reject);
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

    createAssetsDirectory() {
        return mkdirp(this.initConfig.assetRelativeDir);
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

/**
 * @param {InitConfig} initConfig
 * @return {ProviderConfig}
 */
function getJsProvider(initConfig) {
    const jsType = initConfig.jsType
    const providers = {
        [InitConfig.jsTypeVanilla]: vanillaProvider,
        [InitConfig.jsTypeReact]: reactProvider,
        [InitConfig.jsTypeVue]: vueProvider
    };

    if (typeof providers[jsType] === 'undefined') {
        throw new Error(`Could not find a valid provider for type "${jsType}"`);
    }

    const provider = providers[jsType];

    const methodKeys = ['getEntryPath', 'getEncoreActivationMethod', 'getDependencies', 'build'];

    methodKeys.forEach((method) => {
        if (!(typeof provider[method] === 'function')) {
            throw new Error(`Invalid or missing ${method} for provider ${jsType}.`);
        }
    });

    return new ProviderConfig(
        initConfig,
        provider.getEntryPath,
        provider.getEncoreActivationMethod,
        provider.getDependencies,
        provider.build
    );
}

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
    const jsProvider = getJsProvider(initConfig);

    options = Object.assign({
        installDeps: true
    }, options);

    return generator.createWebpackConfig(
            jsProvider.getEntryPath(),
            jsProvider.getEncoreActivationMethod()
        )
        .then(() => generator.createPackageJsonFile())
        .then(() => generator.addDependencies(options.installDeps, jsProvider.getDependencies()))
        .then(() => generator.addPackageJsonScripts())
        .then(() => generator.createPostCssConfig())
        .then(() => generator.createAssetsDirectory())
        .then(() => jsProvider.build())
        .then(() => console.log('Success!'))
        .catch((error) => {
            const pe = new PrettyError();

            if (Array.isArray(error)) {
                error = error[0];
            }

            console.log(pe.render(error));
        });
};

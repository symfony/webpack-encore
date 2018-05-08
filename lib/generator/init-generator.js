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
    // directory where all compiled assets are written
    .setOutputPath('${outputPath}')

    // what's the public path to the output directory (relative to your project's document root dir)
    .setPublicPath('${publicPath}')

    // Your first entry. Usually, this entry contains global
    // JS and CSS for your site. In that case, be sure to include
    // a script tag to the built file ({outputPath}/app.js) in
    // your base layout. You can also require CSS from this file.
    // If you do, also add a link tag to the built CSS file ({outputPath}/app.css).
    .addEntry('app', './assets/app.js')

    /*
     * Add individual "entries" for other pages that need
     * their own JavaScript or CSS. Then, include the
     * script (and link tag if you import CSS) to that
     * individual page only.
     *
     * For a performance gain on sites with multiple pages,
     * see: https://symfony.com/doc/current/frontend/encore/shared-entry.html
     */
    // This would output a {outputPath}/otherPage.js file 
    // addEntry('otherPage', './assets/other.js')

    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()

    // enable support for PostCSS (https://github.com/postcss/postcss)
    .enablePostCssLoader()

    // show OS notifications when builds finish/fail
    .enableBuildNotifications()

    // enable source maps during development
    .enableSourceMaps(!Encore.isProduction())

    // create hashed filenames (e.g. app.abc123.css)
    // .enableVersioning()

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

        webpackConfig += `

    /*
     * Encore supports *many* other features, including
     * framework support (e.g. React, Vue)
     */ 
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

        console.log(chalk.green('  installing required packages...'));

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
            console.log(chalk.yellow(`    yarn ${yarnArgs.join(' ')}`));
            yarnProcess.on('close', (code) => {
                if (code !== 0) {
                    return reject(`Yarn exited with code ${code}`);
                }

                resolve();
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

    createAppEntryFile() {
        const assetsPath = path.join(this.initConfig.projectPath, this.initConfig.assetRelativeDir);
        mkdirp.sync(assetsPath);

        const jsContents = `
/*
 * The main layout entry for the app.
 * 
 * Add a script tag to the built version of this JavaScript file
 * and a link tag to the built CSS file in your base layout.
 */

// a CSS file will also be built with any required CSS
require('./app.${this.initConfig.cssFileExtension}');

// need jQuery? Install it with "yarn add jquery --dev" and require it
// const $ = require('jquery');

console.log('The app is alive!');

// More docs at: https://symfony.com/doc/current/frontend.html
`;

        const cssContents = `
/* Add your real CSS here */
#webpack-encore {
    background: lightblue;
}
        `;

        return this._writeFileSafe(path.join(this.initConfig.assetRelativeDir, 'app.js'), jsContents)
            .then(() => this._writeFileSafe(path.join(this.initConfig.assetRelativeDir, 'app.'+this.initConfig.cssFileExtension), cssContents));
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

    console.log('');

    return generator.addDependencies(options.installDeps)
        .then(() => generator.createWebpackConfig())
        .then(() => generator.createAppEntryFile())
        .then(() => generator.createPostCssConfig())
        .then(() => {
            console.log('');
            console.log(chalk.green('Success! We\'re done!'));
            console.log('');
            console.log(`  A new ${chalk.yellow('webpack.config.js')} file was just generated for you`);
            console.log('  along with new app.js and app.css files to get you started.');
            console.log('');
            console.log('  After inspecting these files, build your first Webpack assets by running:');
            console.log(`    ${chalk.yellow('yarn run encore dev')}`);
            console.log('');
            console.log(`  This will output new files into the ${chalk.yellow('outputDir')} defined in webpack.config.js`);
            console.log('');
            console.log(`  Add ${chalk.yellow('script')} and ${chalk.yellow('link')} tags to these files in your app, and have fun!`);
            console.log('  For more, see https://symfony.com/doc/current/frontend.html');
            console.log('');
        })
        .catch((error) => {
            const pe = new PrettyError();

            if (Array.isArray(error)) {
                error = error[0];
            }

            console.log(pe.render(error));
        });
};

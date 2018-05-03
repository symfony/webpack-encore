/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const inquirer = require('inquirer');
const childProcess = require('child_process');
const InitConfig = require('./InitConfig');

function askOutputPath() {
    console.log('Where would you like your built assets to be generated (should be publicly accessible)?');
    return inquirer.prompt({
        type: 'input',
        message: 'Output Path',
        name: 'outputPath',
        default: 'public/build'
    }).then((response) => {
        return response.outputPath;
    });
}

function askPublicPath(outputPath) {
    // normalize Windows slashes
    outputPath = outputPath.replace(/\/$/, '');
    const suggestion = '/' + outputPath.substr(outputPath.lastIndexOf('/') + 1);

    return inquirer.prompt({
        type: 'input',
        message: `What is the public path to the ${outputPath} directory?`,
        name: 'publicPath',
        default: suggestion
    }).then((response) => {
        return response.publicPath;
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
                value: InitConfig.jsTypeVanilla
            },
            {
                name: 'B) React',
                value: InitConfig.jsTypeReact
            },
            {
                name: 'C) Vue.js',
                value: InitConfig.jsTypeVue
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
                value: InitConfig.cssTypeSass
            },
            {
                name: 'B) LESS',
                value: InitConfig.cssTypeLess
            },
            {
                name: 'C) Vanilla CSS',
                value: InitConfig.cssTypeCss
            }
        ]
    }).then((response) => {
        return response.cssType;
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

module.exports = function(projectPath) {
    const appConfig = new InitConfig(projectPath);
    // we create an "app" entry during init
    appConfig.entryName = 'app';

    if (!isYarnAvailable()) {
        throw new Error('Yarn is required to run the init command: https://yarnpkg.com/lang/en/docs/install/');
    }

    return new Promise((resolve, reject) => {
        askOutputPath().then(outputPath => {
            appConfig.outputPath = outputPath;

            askPublicPath(appConfig.outputPath).then(publicPath => {
                appConfig.publicPath = publicPath;

                askIsSPA().then(isSpa => {
                    appConfig.isSpa = isSpa;
                    if (isSpa) {
                        askJavaScriptType().then(jsType => {
                            appConfig.jsType = jsType;

                            askCssType().then(cssType => {
                                appConfig.cssType = cssType;

                                resolve(appConfig);
                            });
                        });
                    } else {
                        // for multi-page apps, the main shared entry
                        // will always be vanilla JS
                        appConfig.jsType = InitConfig.jsTypeVanilla;

                        askCssType().then(cssType => {
                            appConfig.cssType = cssType;

                            resolve(appConfig);
                        });
                    }
                });
            });
        });
    });
};

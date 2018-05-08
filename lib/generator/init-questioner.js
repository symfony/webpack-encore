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
const chalk = require('chalk');

function askOutputPath() {
    console.log('  Where would you like your built assets to be generated (should be publicly accessible)?');
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
        message: `What is the public path to the ${chalk.yellow(outputPath)} directory?`,
        name: 'publicPath',
        default: suggestion
    }).then((response) => {
        return response.publicPath;
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

    console.log('');
    console.log(chalk.green('Welcome to Webpack Encore!'));
    console.log('');
    console.log('  Answer a few questions so that we can help bootstrap your setup:');
    console.log('');

    return new Promise((resolve, reject) => {
        askOutputPath().then(outputPath => {
            appConfig.outputPath = outputPath;

            askPublicPath(appConfig.outputPath).then(publicPath => {
                appConfig.publicPath = publicPath;

                askCssType().then(cssType => {
                    appConfig.cssType = cssType;

                    resolve(appConfig);
                });
            });
        });
    });
};

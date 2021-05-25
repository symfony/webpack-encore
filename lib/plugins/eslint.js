/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

'use strict';

const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const EslintPlugin = require('eslint-webpack-plugin'); //eslint-disable-line node/no-unpublished-require
const applyOptionsCallback = require('../utils/apply-options-callback');
const pluginFeatures = require('../features');

function isMissingConfigError(e) {
    if (!e.message || !e.message.includes('No ESLint configuration found')) {
        return false;
    }

    return true;
}

/**
 * Support for ESLint.
 *
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (webpackConfig.useEslintPlugin) {
        pluginFeatures.ensurePackagesExistAndAreCorrectVersion('eslint_plugin');

        const { ESLint } = require('eslint'); // eslint-disable-line node/no-unpublished-require
        const eslint = new ESLint({
            cwd: webpackConfig.runtimeConfig.context,
        });

        try {
            (async function() {
                await eslint.calculateConfigForFile('webpack.config.js');
            })();
        } catch (e) {
            if (isMissingConfigError(e)) {
                const chalk = require('chalk');
                const packageHelper = require('../package-helper');

                const message = `No ESLint configuration has been found.

${chalk.bgGreen.black('', 'FIX', '')} Run command ${chalk.yellow('./node_modules/.bin/eslint --init')} or manually create a ${chalk.yellow('.eslintrc.js')} file at the root of your project.

If you prefer to create a ${chalk.yellow('.eslintrc.js')} file by yourself, here is an example to get you started:

${chalk.yellow(`// .eslintrc.js
module.exports = {
    parser: 'babel-eslint',
    extends: ['eslint:recommended'],
}
`)}

Install ${chalk.yellow('babel-eslint')} to prevent potential parsing issues: ${packageHelper.getInstallCommand([[{ name: 'babel-eslint' }]])}

`;
                throw new Error(message);
            }

            throw e;
        }

        const eslintPluginOptions = {
            emitWarning: true,
            extensions: ['js', 'jsx'],
        };

        plugins.push({
            plugin: new EslintPlugin(
                applyOptionsCallback(webpackConfig.eslintPluginOptionsCallback, eslintPluginOptions)
            ),
        });
    }
};

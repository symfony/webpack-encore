/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

'use strict';

const forceSync = require('sync-rpc');
const hasEslintConfiguration = forceSync(require.resolve('../utils/has-eslint-configuration'));
const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const applyOptionsCallback = require('../utils/apply-options-callback');
const pluginFeatures = require('../features');

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

        if (!hasEslintConfiguration(webpackConfig)) {
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

        const eslintPluginOptions = {
            emitWarning: true,
            extensions: ['js', 'jsx'],
        };

        const EslintPlugin = require('eslint-webpack-plugin'); //eslint-disable-line node/no-unpublished-require

        plugins.push({
            plugin: new EslintPlugin(
                applyOptionsCallback(webpackConfig.eslintPluginOptionsCallback, eslintPluginOptions)
            ),
        });
    }
};

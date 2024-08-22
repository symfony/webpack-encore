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
const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const applyOptionsCallback = require('../utils/apply-options-callback');
const pluginFeatures = require('../features');
const babelLoaderUtil = require('../loaders/babel');

/**
 * Support for ESLint.
 *
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (webpackConfig.useEslintPlugin) {
        const hasEslintConfiguration = forceSync(require.resolve('../utils/has-eslint-configuration'));

        pluginFeatures.ensurePackagesExistAndAreCorrectVersion('eslint_plugin');

        if (!hasEslintConfiguration(webpackConfig)) {
            const chalk = require('chalk');
            const packageHelper = require('../package-helper');

            let message = `No ESLint configuration has been found.

${chalk.bgGreen.black('', 'FIX', '')} Run command ${chalk.yellow('./node_modules/.bin/eslint --init')} or manually create a ${chalk.yellow('.eslintrc.js')} file at the root of your project.

If you prefer to create a ${chalk.yellow('.eslintrc.js')} file by yourself, here is an example to get you started:

${chalk.yellow(`// .eslintrc.js
module.exports = {
    root: true,
    parser: '@babel/eslint-parser',
    extends: ['eslint:recommended'],
}
`)}

Install ${chalk.yellow('@babel/eslint-parser')} to prevent potential parsing issues: ${packageHelper.getInstallCommand([[{ name: '@babel/eslint-parser' }]])}
`;
            if (!webpackConfig.doesBabelRcFileExist()) {
                const babelConfig = babelLoaderUtil.getLoaders(webpackConfig)[0].options;
                // cacheDirectory is a custom loader option, not a Babel option
                delete babelConfig['cacheDirectory'];

                (babelConfig['presets'] || []).forEach(preset => {
                    if (!Array.isArray(preset)) {
                        return;
                    }

                    if (typeof preset[0] === 'string' && preset[0].includes('@babel') && preset[0].includes('preset-env')) {
                        // The goal is to replace the preset string with a require.resolve() call, executed at runtime.
                        // Since we output the Babel config as JSON, we need to replace it with a placeholder.
                        preset[0] = '__PATH_TO_BABEL_PRESET_ENV__';

                        // The option "targets" is not necessary
                        delete preset[1]['targets'];

                        // If needed, specify the core-js version to use
                        if (preset[1]['corejs'] === null) {
                            preset[1]['corejs'] = packageHelper.getPackageVersion('core-js');
                        }
                    }
                });

                message += `

You will also need to specify your Babel config in a separate file. The current
configuration Encore has been adding for your is:

${chalk.yellow(`// babel.config.js
module.exports = ${
    JSON.stringify(babelConfig, null, 4)
        .replace('"__PATH_TO_BABEL_PRESET_ENV__"', 'require.resolve("@babel/preset-env")')
}
`)}`;

                if (webpackConfig.babelConfigurationCallback) {
                    message += `\nAdditionally, remove the ${chalk.yellow('.configureBabel()')} in webpack.config.js: this will no longer be used.`;
                }

                if (webpackConfig.babelPresetEnvOptionsCallback) {
                    message += `\nAnd remove the ${chalk.yellow('.configureBabelPresetEnv()')} in webpack.config.js: this will no longer be used.`;
                }
            }

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

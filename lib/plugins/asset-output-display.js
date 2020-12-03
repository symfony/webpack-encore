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
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin'); //eslint-disable-line no-unused-vars
const pathUtil = require('../config/path-util');
const AssetOutputDisplayPlugin = require('../friendly-errors/asset-output-display-plugin');
const PluginPriorities = require('./plugin-priorities');

/**
 * Updates plugins array passed adding AssetOutputDisplayPlugin instance
 *
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @param {FriendlyErrorsWebpackPlugin} friendlyErrorsPlugin
 * @returns {void}
 */
module.exports = function(plugins, webpackConfig, friendlyErrorsPlugin) {
    if (webpackConfig.useDevServer()) {
        return;
    }

    const outputPath = pathUtil.getRelativeOutputPath(webpackConfig);
    plugins.push({
        plugin: new AssetOutputDisplayPlugin(outputPath, friendlyErrorsPlugin),
        priority: PluginPriorities.AssetOutputDisplayPlugin
    });
};

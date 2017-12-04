/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    for (const config of webpackConfig.copyWebpackPluginConfigs) {
        const copyWebpackPluginOptions = {};

        plugins.push({
            plugin: new CopyWebpackPlugin(
                config.patterns,
                applyOptionsCallback(config.optionsCallback, copyWebpackPluginOptions)
            ),
            priority: PluginPriorities.CopyWebpackPlugin
        });
    }
};

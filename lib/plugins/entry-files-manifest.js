/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

/**
 * @import WebpackConfig from '../WebpackConfig'
 */

const PluginPriorities = require('./plugin-priorities');
const { EntryPointsPlugin } = require('../webpack/entry-points-plugin');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
module.exports = function(plugins, webpackConfig) {
    plugins.push({
        plugin: new EntryPointsPlugin({
            publicPath: webpackConfig.getRealPublicPath(),
            outputPath: webpackConfig.outputPath,
            integrityAlgorithms: webpackConfig.integrityAlgorithms
        }),
        priority: PluginPriorities.EntryPointsPlugin
    });
};

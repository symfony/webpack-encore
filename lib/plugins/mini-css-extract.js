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
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    // Don't add the plugin if CSS extraction is disabled
    if (!webpackConfig.extractCss) {
        return;
    }

    // Default filename can be overridden using Encore.configureFilenames({ css: '...' })
    let filename = webpackConfig.useVersioning ? '[name].[contenthash:8].css' : '[name].css';
    // the chunk filename should use [id], not [name]. But, due
    // to weird behavior (bug?) that's exposed in a functional test
    // (in production mode, code is uglified), in some cases, an entry
    // CSS file mysteriously becomes a chunk. In other words, it
    // will have a filename like 1.css instead of entry_name.css
    // This is related to setting optimization.runtimeChunk = 'single';
    // See https://github.com/webpack/webpack/issues/6598
    let chunkFilename = webpackConfig.useVersioning ? '[name].[contenthash:8].css' : '[name].css';
    if (webpackConfig.configuredFilenames.css) {
        filename = webpackConfig.configuredFilenames.css;

        // see above: originally we did NOT set this, because this was
        // only for split chunks. But now, sometimes the "entry" CSS chunk
        // will use chunkFilename. So, we need to always respect the
        // user's wishes
        chunkFilename = webpackConfig.configuredFilenames.css;
    }

    const miniCssPluginOptions = {
        filename: filename,
        chunkFilename: chunkFilename
    };

    plugins.push({
        plugin: new MiniCssExtractPlugin(
            applyOptionsCallback(
                webpackConfig.miniCssExtractPluginConfigurationCallback,
                miniCssPluginOptions
            )
        ),
        priority: PluginPriorities.MiniCssExtractPlugin
    });
};

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    // Default filename can be overridden using Encore.configureFilenames({ css: '...' })
    let filename = webpackConfig.useVersioning ? '[name].[contenthash:8].css' : '[name].css';
    let chunkFilename = webpackConfig.useVersioning ? '[id].[contenthash:8].css' : '[id].css';
    if (webpackConfig.configuredFilenames.css) {
        filename = webpackConfig.configuredFilenames.css;
    }

    const extractTextPluginOptions = {
        filename: filename,
        chunkFilename
    };

    plugins.push({
        plugin: new MiniCssExtractPlugin(extractTextPluginOptions),
        priority: PluginPriorities.MiniCssExtractPlugin
    });
};

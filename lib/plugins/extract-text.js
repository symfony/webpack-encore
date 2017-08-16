/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @param {Object} extractTextOptions Options to pass to the plugin
 * @return {void}
 */
module.exports = function(plugins, webpackConfig, extractTextOptions = {}) {

    /*
     * All CSS/SCSS content (due to the loaders above) will be
     * extracted into an [entrypointname].css files. The result
     * is that NO css will be inlined, *except* CSS that is required
     * in an async way (e.g. via require.ensure()).
     *
     * This may not be ideal in some cases, but it's at least
     * predictable. It means that you must manually add a
     * link tag for an entry point's CSS (unless no CSS file
     * was imported - in which case no CSS file will be dumped).
     */

    // Default filename can be overriden using Encore.configureFilenames({ css: '...' })
    let filename = webpackConfig.useVersioning ? '[name].[contenthash].css' : '[name].css';
    if (webpackConfig.configuredFilenames.css) {
        filename = webpackConfig.configuredFilenames.css;
    }

    let config = Object.assign({}, extractTextOptions, {
        filename: filename,
        // if true, async CSS (e.g. loaded via require.ensure())
        // is extracted to the entry point CSS. If false, it's
        // inlined in the AJAX-loaded .js file.
        allChunks: false
    });

    plugins.push(new ExtractTextPlugin(config));
};

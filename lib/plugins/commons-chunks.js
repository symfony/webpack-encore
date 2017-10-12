/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');
const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {

    if (!webpackConfig.sharedCommonsEntryName) {
        return;
    }

    // if we're extracting a vendor chunk, set it up!
    plugins.push({
        plugin: new webpack.optimize.CommonsChunkPlugin({
            name: [
                webpackConfig.sharedCommonsEntryName,
                /*
                * Always dump a 2nd file - manifest.json that
                * will contain the webpack manifest information.
                * This changes frequently, and without this line,
                * it would be packaged inside the "shared commons entry"
                * file - e.g. vendor.js, which would prevent long-term caching.
                */
                'manifest'
            ],
            minChunks: Infinity,
        }),
        priority: PluginPriorities.CommonsChunkPlugin
    });
};

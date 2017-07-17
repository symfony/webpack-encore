/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of plugins to add to webpack
 */
module.exports = {
    getPlugins(webpackConfig) {

        return [new webpack.optimize.CommonsChunkPlugin({
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
        })];
    }
};

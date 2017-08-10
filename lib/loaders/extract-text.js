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
 * Wraps style loaders with the ExtractTextPlugin.
 *
 * @param {WebpackConfig} webpackConfig
 * @param {Array} loaders An array of some style loaders
 * @param {bool} useVueStyleLoader
 * @return {Array}
 */
module.exports = {
    extract(webpackConfig, loaders, useVueStyleLoader = false) {
        return ExtractTextPlugin.extract({
            fallback: (useVueStyleLoader ? 'vue-style-loader' : 'style-loader') + (webpackConfig.useSourceMaps ? '?sourceMap' : ''),
            use: loaders
        });
    }
};

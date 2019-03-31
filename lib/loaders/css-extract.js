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

module.exports = {
    /**
     * Prepends loaders with MiniCssExtractPlugin.loader
     *
     * @param {WebpackConfig} webpackConfig
     * @param {Array} loaders An array of some style loaders
     * @return {Array}
     */
    prependLoaders(webpackConfig, loaders) {
        if (!webpackConfig.extractCss) {
            // If the CSS extraction is disabled, use the
            // style-loader instead.
            return [{
                loader: 'style-loader',
                options: {
                    sourceMap: webpackConfig.useSourceMaps,
                }
            }, ...loaders];
        }

        return [MiniCssExtractPlugin.loader, ...loaders];
    }
};

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

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const applyOptionsCallback = require('../utils/apply-options-callback');

module.exports = {
    /**
     * Prepends loaders with MiniCssExtractPlugin.loader
     *
     * @param {WebpackConfig} webpackConfig
     * @param {Array} loaders An array of some style loaders
     * @returns {Array}
     */
    prependLoaders(webpackConfig, loaders) {
        if (!webpackConfig.extractCss) {

            const options = {};

            // If the CSS extraction is disabled, use the
            // style-loader instead.
            return [{
                loader: require.resolve('style-loader'),
                options: applyOptionsCallback(webpackConfig.styleLoaderConfigurationCallback, options)

            }, ...loaders];
        }

        return [{
            loader: MiniCssExtractPlugin.loader,
            options: applyOptionsCallback(
                webpackConfig.miniCssExtractLoaderConfigurationCallback,
                {}
            ),
        }, ...loaders];
    }
};

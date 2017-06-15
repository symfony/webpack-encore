/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderFeatures = require('../loader-features');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for CSS files
 */
module.exports = function(webpackConfig) {
    const cssLoaders = [
        {
            loader: 'css-loader',
            options: {
                minimize: webpackConfig.isProduction(),
                sourceMap: webpackConfig.useSourceMaps
            }
        },
    ];

    if (webpackConfig.usePostCssLoader) {
        loaderFeatures.ensureLoaderPackagesExist('postcss');

        cssLoaders.push({
            loader: 'postcss-loader',
            options: {
                sourceMap: webpackConfig.useSourceMaps
            }
        });
    }

    return cssLoaders;
};

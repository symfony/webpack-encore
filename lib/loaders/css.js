/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderFeatures = require('../features');

/**
 * @param {WebpackConfig} webpackConfig
 * @param {bool} ignorePostCssLoader If true, postcss-loader will never be added
 * @return {Array} of loaders to use for CSS files
 */
module.exports = {
    getLoaders(webpackConfig, skipPostCssLoader) {
        const usePostCssLoader = webpackConfig.usePostCssLoader && !skipPostCssLoader;

        const cssLoaders = [
            {
                loader: 'css-loader',
                options: {
                    minimize: webpackConfig.isProduction(),
                    sourceMap: webpackConfig.useSourceMaps,
                    // when using @import, how many loaders *before* css-loader should
                    // be applied to those imports? This defaults to 0. When postcss-loader
                    // is used, we set it to 1, so that postcss-loader is applied
                    // to @import resources.
                    importLoaders: usePostCssLoader ? 1 : 0
                }
            },
        ];

        if (usePostCssLoader) {
            loaderFeatures.ensurePackagesExist('postcss');

            const postCssLoaderOptions = {
                sourceMap: webpackConfig.useSourceMaps
            };

            // allow options to be configured
            webpackConfig.postCssLoaderOptionsCallback.apply(
                // use config as the this variable
                postCssLoaderOptions,
                [postCssLoaderOptions]
            );

            cssLoaders.push({
                loader: 'postcss-loader',
                options: postCssLoaderOptions
            });
        }

        return cssLoaders;
    }
};

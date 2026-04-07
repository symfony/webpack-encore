/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @import WebpackConfig from '../WebpackConfig.js'
 */

import { fileURLToPath } from 'url';

import loaderFeatures from '../features.js';
import applyOptionsCallback from '../utils/apply-options-callback.js';

export default {
    /**
     * @param {WebpackConfig} webpackConfig
     * @param {boolean} useCssModules
     * @returns {Array} of loaders to use for CSS files
     */
    getLoaders(webpackConfig, useCssModules = false) {
        const usePostCssLoader = webpackConfig.usePostCssLoader;

        /**
         * @type {boolean|object}
         */
        let modulesConfig = false;
        if (useCssModules) {
            modulesConfig = {
                localIdentName: '[local]_[hash:base64:5]',
            };
        }

        const options = {
            sourceMap: webpackConfig.useSourceMaps,
            // when using @import, how many loaders *before* css-loader should
            // be applied to those imports? This defaults to 0. When postcss-loader
            // is used, we set it to 1, so that postcss-loader is applied
            // to @import resources.
            importLoaders: usePostCssLoader ? 1 : 0,
            modules: modulesConfig,
        };

        const cssLoaders = [
            {
                loader: fileURLToPath(import.meta.resolve('css-loader')),
                options: applyOptionsCallback(
                    webpackConfig.cssLoaderConfigurationCallback,
                    options
                ),
            },
        ];

        if (usePostCssLoader) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('postcss');

            const postCssLoaderOptions = {
                sourceMap: webpackConfig.useSourceMaps,
            };

            cssLoaders.push({
                loader: fileURLToPath(import.meta.resolve('postcss-loader')),
                options: applyOptionsCallback(
                    webpackConfig.postCssLoaderOptionsCallback,
                    postCssLoaderOptions
                ),
            });
        }

        return cssLoaders;
    },
};

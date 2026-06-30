/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'url';

import loaderFeatures from '../features.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.js';
import cssLoader from './css.ts';

export default {
    getLoaders(webpackConfig: WebpackConfig, useCssModules = false) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('sass');

        const sassLoaders = [...cssLoader.getLoaders(webpackConfig, useCssModules)];
        if (true === webpackConfig.sassOptions.resolveUrlLoader) {
            // responsible for resolving Sass url() paths
            // without this, all url() paths must be relative to the
            // entry file, not the file that contains the url()
            sassLoaders.push({
                loader: fileURLToPath(import.meta.resolve('resolve-url-loader')),
                options: Object.assign(
                    {
                        sourceMap: webpackConfig.useSourceMaps,
                    },
                    webpackConfig.sassOptions.resolveUrlLoaderOptions
                ),
            });
        }

        const config = Object.assign(
            {},
            {
                // needed by the resolve-url-loader
                sourceMap:
                    true === webpackConfig.sassOptions.resolveUrlLoader ||
                    webpackConfig.useSourceMaps,
                sassOptions: {
                    // CSS minification is handled with mini-css-extract-plugin
                    outputStyle: 'expanded',
                },
            }
        );

        sassLoaders.push({
            loader: fileURLToPath(import.meta.resolve('sass-loader')),
            options: applyOptionsCallback(webpackConfig.sassLoaderOptionsCallback, config),
        });

        return sassLoaders;
    },
};

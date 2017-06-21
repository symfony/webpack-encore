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
const cssLoader = require('./css');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for Sass files
 */
module.exports = {
    getLoaders(webpackConfig) {
        loaderFeatures.ensureLoaderPackagesExist('sass');

        const sassLoaders = [...cssLoader.getLoaders(webpackConfig)];
        if (true === webpackConfig.sassOptions.resolve_url_loader) {
            // responsible for resolving SASS url() paths
            // without this, all url() paths must be relative to the
            // entry file, not the file that contains the url()
            sassLoaders.push({
                loader: 'resolve-url-loader',
                options: {
                    sourceMap: webpackConfig.useSourceMaps
                }
            });
        }

        sassLoaders.push({
            loader: 'sass-loader',
            options: {
                // needed by the resolve-url-loader
                sourceMap: (true === webpackConfig.sassOptions.resolve_url_loader) || webpackConfig.useSourceMaps
            }
        });

        return sassLoaders;
    }
};

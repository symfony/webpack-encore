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
const loaderFeatures = require('../features');
const cssLoader = require('./css');
const applyOptionsCallback = require('../utils/apply-options-callback');

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @param {boolean} useCssModules
     * @return {Array} of loaders to use for Sass files
     */
    getLoaders(webpackConfig, useCssModules = false) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('sass');

        const sassLoaders = [...cssLoader.getLoaders(webpackConfig, useCssModules)];
        if (true === webpackConfig.sassOptions.resolveUrlLoader) {
            // responsible for resolving Sass url() paths
            // without this, all url() paths must be relative to the
            // entry file, not the file that contains the url()
            sassLoaders.push({
                loader: 'resolve-url-loader',
                options: Object.assign(
                    {
                        sourceMap: webpackConfig.useSourceMaps
                    },
                    webpackConfig.sassOptions.resolveUrlLoaderOptions
                )
            });
        }

        const config = Object.assign({}, {
            // needed by the resolve-url-loader
            sourceMap: (true === webpackConfig.sassOptions.resolveUrlLoader) || webpackConfig.useSourceMaps,
            // CSS minification is handled with mini-css-extract-plugin
            outputStyle: 'expanded'
        });

        sassLoaders.push({
            loader: 'sass-loader',
            options: applyOptionsCallback(webpackConfig.sassLoaderOptionsCallback, config)
        });

        return sassLoaders;
    }
};

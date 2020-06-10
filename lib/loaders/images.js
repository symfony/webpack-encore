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
const applyOptionsCallback = require('../utils/apply-options-callback');

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @return {Array} of loaders to use for images
     */
    getLoaders(webpackConfig) {

        // Default filename can be overridden using Encore.configureFilenames({ images: '...' })
        let filename = 'images/[name].[hash:8].[ext]';
        if (webpackConfig.configuredFilenames.images) {
            filename = webpackConfig.configuredFilenames.images;
        }

        // The url-loader can be used instead of the default file-loader by
        // calling Encore.configureUrlLoader({ images: {/* ... */}})
        let loaderName = 'file-loader';
        const loaderOptions = {
            name: filename,
            publicPath: webpackConfig.getRealPublicPath()
        };

        if (webpackConfig.urlLoaderOptions.images) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('urlloader');
            loaderName = 'url-loader';
            Object.assign(loaderOptions, webpackConfig.urlLoaderOptions.images);
        }

        const imagesLoaders = [{
            loader: require.resolve(loaderName),
            options: loaderOptions
        }];

        if (webpackConfig.useImagemin) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('imagemin');

            imagesLoaders.push({
                loader: require.resolve('image-webpack-loader'),
                options: applyOptionsCallback(webpackConfig.imageminLoaderOptionsCallback, {})
            });
        }

        return imagesLoaders;
    }
};

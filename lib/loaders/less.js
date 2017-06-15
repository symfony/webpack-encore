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
 * @param {bool} ignorePostCssLoader If true, postcss-loader will never be added
 * @return {Array} of loaders to use for Less files
 */
module.exports = {
    getLoaders(webpackConfig, ignorePostCssLoader = false) {
        loaderFeatures.ensureLoaderPackagesExist('less');

        return [
            ...cssLoader.getLoaders(webpackConfig, ignorePostCssLoader),
            {
                loader: 'less-loader',
                options: {
                    sourceMap: webpackConfig.useSourceMaps
                }
            },
        ];
    }
};

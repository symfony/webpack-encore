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
     * @return {Array} of loaders to use for Stylus files
     */
    getLoaders(webpackConfig, useCssModules = false) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('stylus');

        const config = {
            sourceMap: webpackConfig.useSourceMaps
        };

        return [
            ...cssLoader.getLoaders(webpackConfig, useCssModules),
            {
                loader: 'stylus-loader',
                options: applyOptionsCallback(webpackConfig.stylusLoaderOptionsCallback, config)
            },
        ];
    }
};

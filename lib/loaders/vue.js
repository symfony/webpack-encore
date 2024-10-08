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

const loaderFeatures = require('../features');
const applyOptionsCallback = require('../utils/apply-options-callback');
const getVueVersion = require('../utils/get-vue-version');

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @returns {Array} of loaders to use for Vue files
     */
    getLoaders(webpackConfig) {
        const vueVersion = getVueVersion(webpackConfig);
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('vue' + vueVersion);

        const options = {};

        return [
            {
                loader: require.resolve('vue-loader'),
                options: applyOptionsCallback(webpackConfig.vueLoaderOptionsCallback, options)
            }
        ];
    }
};

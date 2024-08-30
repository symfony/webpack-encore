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

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @returns {Array} of loaders to use for Handlebars
     */
    getLoaders(webpackConfig) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('handlebars');

        const options = {};

        return [
            {
                loader: require.resolve('handlebars-loader'),
                options: applyOptionsCallback(webpackConfig.handlebarsConfigurationCallback, options)
            }
        ];
    }
};

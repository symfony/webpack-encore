/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {object}
 */
module.exports = function(webpackConfig) {
    const optimizePluginOptions = {};

    return new OptimizeCSSAssetsPlugin(
        applyOptionsCallback(webpackConfig.optimizeCssPluginOptionsCallback, optimizePluginOptions)
    );
};

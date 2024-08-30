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

const TerserPlugin = require('terser-webpack-plugin');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {object}
 */
module.exports = function(webpackConfig) {
    const terserPluginOptions = {
        parallel: true,
    };

    return new TerserPlugin(
        applyOptionsCallback(webpackConfig.terserPluginOptionsCallback, terserPluginOptions)
    );
};

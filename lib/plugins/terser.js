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
const TerserPlugin = require('terser-webpack-plugin');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {object}
 */
module.exports = function(webpackConfig) {
    const terserPluginOptions = {
        sourceMap: webpackConfig.useSourceMaps,
        cache: true,
        parallel: true,
    };

    return new TerserPlugin(
        applyOptionsCallback(webpackConfig.terserPluginOptionsCallback, terserPluginOptions)
    );
};

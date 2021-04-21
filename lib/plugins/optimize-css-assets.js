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
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {object}
 */
module.exports = function(webpackConfig) {
    const minimizerPluginOptions = {};

    return new CssMinimizerPlugin(
        applyOptionsCallback(webpackConfig.cssMinimizerPluginOptionsCallback, minimizerPluginOptions)
    );
};

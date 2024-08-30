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

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
module.exports = function(webpackConfig) {
    const config = {};

    webpackConfig.addPlugin(
        new ForkTsCheckerWebpackPlugin(
            applyOptionsCallback(webpackConfig.forkedTypeScriptTypesCheckOptionsCallback, config)
        ),
        PluginPriorities.ForkTsCheckerWebpackPlugin
    );
};

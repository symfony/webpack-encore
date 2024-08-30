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

const webpack = require('webpack');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
module.exports = function(plugins, webpackConfig) {
    const definePluginOptions = {
        'process.env.NODE_ENV': webpackConfig.isProduction()
            ? '"production"'
            : '"development"',
    };

    plugins.push({
        plugin: new webpack.DefinePlugin(
            applyOptionsCallback(webpackConfig.definePluginOptionsCallback, definePluginOptions)
        ),
        priority: PluginPriorities.DefinePlugin
    });
};

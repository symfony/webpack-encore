/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');
const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    const definePluginOptions = {
        'process.env': {
            NODE_ENV: webpackConfig.isProduction() ? '"production"' : '"development"'
        }
    };

    webpackConfig.definePluginOptionsCallback.apply(
        definePluginOptions,
        [definePluginOptions]
    );

    plugins.push({
        plugin: new webpack.DefinePlugin(definePluginOptions),
        priority: PluginPriorities.DefinePlugin
    });
};

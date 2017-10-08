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

    if (!webpackConfig.isProduction()) {
        return;
    }

    const uglifyJsPluginOptions = {
        sourceMap: webpackConfig.useSourceMaps
    };

    webpackConfig.uglifyJsPluginOptionsCallback.apply(
        uglifyJsPluginOptions,
        [uglifyJsPluginOptions]
    );

    plugins.push({
        plugin: new webpack.optimize.UglifyJsPlugin(uglifyJsPluginOptions),
        priority: PluginPriorities.UglifyJsPlugin
    });
};

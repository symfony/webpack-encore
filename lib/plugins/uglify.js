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

    let uglifyJsPluginOptions = {
        sourceMap: webpackConfig.useSourceMaps
    };

    const callbackResult = webpackConfig.uglifyJsPluginOptionsCallback.apply(
        uglifyJsPluginOptions,
        [uglifyJsPluginOptions]
    );

    if (callbackResult instanceof Object) {
        uglifyJsPluginOptions = callbackResult;
    }

    plugins.push({
        plugin: new webpack.optimize.UglifyJsPlugin(uglifyJsPluginOptions),
        priority: PluginPriorities.UglifyJsPlugin
    });
};

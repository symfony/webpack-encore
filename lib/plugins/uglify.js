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

    plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyJsPluginOptions));
};

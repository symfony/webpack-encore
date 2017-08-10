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
 * @param {Object} uglifyOptions
 * @return {void}
 */
module.exports = function(plugins, webpackConfig, uglifyOptions = {}) {

    if (!webpackConfig.isProduction()) {
        return;
    }

    let uglifyConfig = Object.assign({}, uglifyOptions, {
        sourceMap: webpackConfig.useSourceMaps
    });
    let uglify = new webpack.optimize.UglifyJsPlugin(uglifyConfig);

    plugins.push(uglify);
};

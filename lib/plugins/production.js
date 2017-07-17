/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of plugins to add to webpack
 */
module.exports = {
    getPlugins(webpackConfig, defineOptions = {}, uglifyOptions = {}) {

        let defineConfig = Object.assign({}, defineOptions, {
            'process.env': {
                NODE_ENV: '"production"'
            }
        });
        let define = new webpack.DefinePlugin(defineConfig);

        let uglifyConfig = Object.assign({}, uglifyOptions, {
            sourceMap: webpackConfig.useSourceMaps
        });
        let uglify = new webpack.optimize.UglifyJsPlugin(uglifyConfig);

        return [define, uglify];
    }
};

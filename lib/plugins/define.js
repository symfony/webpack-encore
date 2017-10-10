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

    const definePluginOptions = {
        'process.env': {
            NODE_ENV: '"production"'
        }
    };

    webpackConfig.definePluginOptionsCallback.apply(
        definePluginOptions,
        [definePluginOptions]
    );

    plugins.push(new webpack.DefinePlugin(definePluginOptions));
};

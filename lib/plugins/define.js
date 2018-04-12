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
    let definePluginOptions = {
        'process.env': {
            NODE_ENV: webpackConfig.isProduction() ? '"production"' : '"development"'
        }
    };

    const callbackResult = webpackConfig.definePluginOptionsCallback.apply(
        definePluginOptions,
        [definePluginOptions]
    );

    if (callbackResult instanceof Object) {
        definePluginOptions = callbackResult;
    }

    plugins.push({
        plugin: new webpack.DefinePlugin(definePluginOptions),
        priority: PluginPriorities.DefinePlugin
    });
};

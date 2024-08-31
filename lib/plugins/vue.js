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

const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (!webpackConfig.useVueLoader) {
        return;
    }

    const { VueLoaderPlugin } = require('vue-loader');

    plugins.push({
        plugin: new VueLoaderPlugin(),
        priority: PluginPriorities.VueLoaderPlugin
    });
};

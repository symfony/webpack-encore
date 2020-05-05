/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const PluginPriorities = require('./plugin-priorities');
const getVueVersion = require('../utils/get-vue-version');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (!webpackConfig.useVueLoader) {
        return;
    }

    const vueVersion = getVueVersion(webpackConfig);
    let VueLoaderPlugin;
    switch (vueVersion) {
        case 2:
            VueLoaderPlugin = require('vue-loader/lib/plugin'); // eslint-disable-line
            break;
        case 3:
            ({ VueLoaderPlugin } = require('vue-loader'));
            break;
        default:
            throw new Error(`Invalid vue version ${vueVersion}`);
    }

    plugins.push({
        plugin: new VueLoaderPlugin(),
        priority: PluginPriorities.VueLoaderPlugin
    });
};

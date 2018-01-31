/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const PluginPriorities = require('./plugin-priorities');
const loaderFeatures = require('../features');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (!webpackConfig.useAurelia) return;

    loaderFeatures.ensurePackagesExist('aurelia-webpack-plugin');

    const AureliaPlugin = require.resolve('aurelia-webpack-plugin');

    plugins.push({
        plugin: new AureliaPlugin(webpackConfig.aureliaPluginConfig),
        priority: PluginPriorities.AureliaPlugin
    });
};

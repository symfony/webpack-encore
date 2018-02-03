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
const { AureliaPlugin } = require('aurelia-webpack-plugin');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (!webpackConfig.useAurelia) return;

    loaderFeatures.ensurePackagesExist('aurelia-webpack-plugin');

    const aureliaPluginOptions = {};

    webpackConfig.aureliaPluginOptionsCallback.apply(
        aureliaPluginOptions,
        [aureliaPluginOptions]
    );

    plugins.push({
        plugin: new AureliaPlugin(aureliaPluginOptions),
        priority: PluginPriorities.AureliaPlugin
    });
};

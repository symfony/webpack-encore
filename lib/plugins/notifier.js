/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const pluginFeatures = require('../features');
const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (!webpackConfig.useWebpackNotifier) {
        return;
    }

    pluginFeatures.ensurePackagesExist('notifier');

    const notifierPluginOptions = {
        title: 'Webpack Encore'
    };

    webpackConfig.notifierPluginOptionsCallback.apply(
        notifierPluginOptions,
        [notifierPluginOptions]
    );

    const WebpackNotifier = require('webpack-notifier'); // eslint-disable-line
    plugins.push({
        plugin: new WebpackNotifier(notifierPluginOptions),
        priority: PluginPriorities.WebpackNotifier
    });
};

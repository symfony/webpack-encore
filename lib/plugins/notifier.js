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
const pluginFeatures = require('../features');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (!webpackConfig.useWebpackNotifier) {
        return;
    }

    pluginFeatures.ensurePackagesExistAndAreCorrectVersion('notifier');

    const notifierPluginOptions = {
        title: 'Webpack Encore'
    };

    const WebpackNotifier = require('webpack-notifier'); // eslint-disable-line
    plugins.push({
        plugin: new WebpackNotifier(
            applyOptionsCallback(webpackConfig.notifierPluginOptionsCallback, notifierPluginOptions)
        ),
        priority: PluginPriorities.WebpackNotifier
    });
};

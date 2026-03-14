/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @import WebpackConfig from '../WebpackConfig'
 */

import pluginFeatures from '../features.js';
import PluginPriorities from './plugin-priorities.js';
import applyOptionsCallback from '../utils/apply-options-callback.js';

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {Promise<void>}
 */
export default async function(plugins, webpackConfig) {
    if (!webpackConfig.useWebpackNotifier) {
        return;
    }

    pluginFeatures.ensurePackagesExistAndAreCorrectVersion('notifier');

    const notifierPluginOptions = {
        title: 'Webpack Encore'
    };

    const { default: WebpackNotifier } = await import('webpack-notifier');
    plugins.push({
        plugin: new WebpackNotifier(
            applyOptionsCallback(webpackConfig.notifierPluginOptionsCallback, notifierPluginOptions)
        ),
        priority: PluginPriorities.WebpackNotifier
    });
}

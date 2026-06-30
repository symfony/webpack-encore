/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { WebpackPluginInstance } from 'webpack';

import pluginFeatures from '../features.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.ts';

export default async function (
    plugins: Array<{ plugin: WebpackPluginInstance; priority: number }>,
    webpackConfig: WebpackConfig
): Promise<void> {
    if (!webpackConfig.useWebpackNotifier) {
        return;
    }

    pluginFeatures.ensurePackagesExistAndAreCorrectVersion('notifier');

    const notifierPluginOptions = {
        title: 'Webpack Encore',
    };

    const { default: WebpackNotifier } = await import('webpack-notifier');
    plugins.push({
        plugin: new WebpackNotifier(
            applyOptionsCallback(webpackConfig.notifierPluginOptionsCallback, notifierPluginOptions)
        ),
        priority: PluginPriorities.WebpackNotifier,
    });
}

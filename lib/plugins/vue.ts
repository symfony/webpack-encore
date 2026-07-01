/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { WebpackPluginInstance } from 'webpack';

import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.ts';

export default async function (
    plugins: Array<{ plugin: WebpackPluginInstance; priority: number }>,
    webpackConfig: WebpackConfig
): Promise<void> {
    if (!webpackConfig.useVueLoader) {
        return;
    }

    const { VueLoaderPlugin } = await import('vue-loader');

    plugins.push({
        plugin: new VueLoaderPlugin(),
        priority: PluginPriorities.VueLoaderPlugin,
    });
}

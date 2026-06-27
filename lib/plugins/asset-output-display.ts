/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type FriendlyErrorsWebpackPlugin from '@kocal/friendly-errors-webpack-plugin';
import type { WebpackPluginInstance } from 'webpack';

import pathUtil from '../config/path-util.js';
import AssetOutputDisplayPlugin from '../friendly-errors/asset-output-display-plugin.ts';
import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.ts';

/**
 * Updates plugins array passed adding AssetOutputDisplayPlugin instance
 */
export default function (
    plugins: Array<{ plugin: WebpackPluginInstance; priority: number }>,
    webpackConfig: WebpackConfig,
    friendlyErrorsPlugin: FriendlyErrorsWebpackPlugin
): void {
    if (webpackConfig.useDevServer()) {
        return;
    }

    const outputPath = pathUtil.getRelativeOutputPath(webpackConfig);
    plugins.push({
        plugin: new AssetOutputDisplayPlugin(outputPath, friendlyErrorsPlugin),
        priority: PluginPriorities.AssetOutputDisplayPlugin,
    });
}

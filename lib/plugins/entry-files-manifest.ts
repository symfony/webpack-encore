/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { WebpackPluginInstance } from 'webpack';

import { EntryPointsPlugin } from '../webpack/entry-points-plugin.ts';
import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.ts';

export default function (
    plugins: Array<{ plugin: WebpackPluginInstance; priority: number }>,
    webpackConfig: WebpackConfig
): void {
    plugins.push({
        plugin: new EntryPointsPlugin({
            publicPath: webpackConfig.getRealPublicPath(),
            outputPath: webpackConfig.outputPath!,
            integrityAlgorithms: webpackConfig.integrityAlgorithms,
        }),
        priority: PluginPriorities.EntryPointsPlugin,
    });
}

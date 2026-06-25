/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import webpack from 'webpack';

import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.ts';

export default function (
    plugins: Array<{ plugin: object; priority: number }>,
    webpackConfig: WebpackConfig
): void {
    if (Object.keys(webpackConfig.providedVariables).length > 0) {
        plugins.push({
            plugin: new webpack.ProvidePlugin(webpackConfig.providedVariables),
            priority: PluginPriorities.ProvidePlugin,
        });
    }
}

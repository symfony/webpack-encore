/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import webpack from 'webpack';

import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.ts';

export default function (
    plugins: Array<{ plugin: object; priority: number }>,
    webpackConfig: WebpackConfig
): void {
    const definePluginOptions = {
        'process.env.NODE_ENV': webpackConfig.isProduction() ? '"production"' : '"development"',
    };

    plugins.push({
        plugin: new webpack.DefinePlugin(
            applyOptionsCallback(webpackConfig.definePluginOptionsCallback, definePluginOptions)
        ),
        priority: PluginPriorities.DefinePlugin,
    });
}

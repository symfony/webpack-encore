/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.js';
import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.js';

export default function (webpackConfig: WebpackConfig): void {
    const config = {};

    webpackConfig.addPlugin(
        new ForkTsCheckerWebpackPlugin(
            applyOptionsCallback(webpackConfig.forkedTypeScriptTypesCheckOptionsCallback, config)
        ),
        PluginPriorities.ForkTsCheckerWebpackPlugin
    );
}

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @import WebpackConfig from '../WebpackConfig.js'
 */

import { EntryPointsPlugin } from '../webpack/entry-points-plugin.js';
import PluginPriorities from './plugin-priorities.js';

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
export default function (plugins, webpackConfig) {
    plugins.push({
        plugin: new EntryPointsPlugin({
            publicPath: webpackConfig.getRealPublicPath(),
            outputPath: webpackConfig.outputPath,
            integrityAlgorithms: webpackConfig.integrityAlgorithms,
        }),
        priority: PluginPriorities.EntryPointsPlugin,
    });
}

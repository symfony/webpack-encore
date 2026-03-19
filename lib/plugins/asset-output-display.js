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

/**
 * @import FriendlyErrorsWebpackPlugin from '@kocal/friendly-errors-webpack-plugin'
 */

import pathUtil from '../config/path-util.js';
import AssetOutputDisplayPlugin from '../friendly-errors/asset-output-display-plugin.js';
import PluginPriorities from './plugin-priorities.js';

/**
 * Updates plugins array passed adding AssetOutputDisplayPlugin instance
 *
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @param {FriendlyErrorsWebpackPlugin} friendlyErrorsPlugin
 * @returns {void}
 */
export default function(plugins, webpackConfig, friendlyErrorsPlugin) {
    if (webpackConfig.useDevServer()) {
        return;
    }

    const outputPath = pathUtil.getRelativeOutputPath(webpackConfig);
    plugins.push({
        plugin: new AssetOutputDisplayPlugin(outputPath, friendlyErrorsPlugin),
        priority: PluginPriorities.AssetOutputDisplayPlugin
    });
}

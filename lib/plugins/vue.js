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

import PluginPriorities from './plugin-priorities.js';

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {Promise<void>}
 */
export default async function(plugins, webpackConfig) {
    if (!webpackConfig.useVueLoader) {
        return;
    }

    const { VueLoaderPlugin } = await import('vue-loader');

    plugins.push({
        plugin: new VueLoaderPlugin(),
        priority: PluginPriorities.VueLoaderPlugin
    });
}

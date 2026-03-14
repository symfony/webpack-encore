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

import DeleteUnusedEntriesJSPlugin from '../webpack/delete-unused-entries-js-plugin.js';
import PluginPriorities from './plugin-priorities.js';
import copyEntryTmpName from '../utils/copyEntryTmpName.js';

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
export default function(plugins, webpackConfig) {
    const entries = [... webpackConfig.styleEntries.keys()];

    if (webpackConfig.copyFilesConfigs.length > 0) {
        entries.push(copyEntryTmpName);
    }

    plugins.push({
        plugin: new DeleteUnusedEntriesJSPlugin(entries),
        priority: PluginPriorities.DeleteUnusedEntriesJSPlugin
    });
}

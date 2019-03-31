/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const DeleteUnusedEntriesJSPlugin = require('../webpack/delete-unused-entries-js-plugin');
const PluginPriorities = require('./plugin-priorities');
const copyEntryTmpName = require('../utils/copyEntryTmpName');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    const entries = [... webpackConfig.styleEntries.keys()];

    if (webpackConfig.copyFilesConfigs.length > 0) {
        entries.push(copyEntryTmpName);
    }

    plugins.push({
        plugin: new DeleteUnusedEntriesJSPlugin(entries),
        priority: PluginPriorities.DeleteUnusedEntriesJSPlugin
    });
};

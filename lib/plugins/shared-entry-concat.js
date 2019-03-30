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
const SharedEntryConcatPlugin = require('../webpack/shared-entry-concat-plugin');
const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (!webpackConfig.sharedCommonsEntryName) {
        return;
    }

    plugins.push({
        plugin: new SharedEntryConcatPlugin(
            webpackConfig.sharedCommonsEntryName
        ),
        priority: PluginPriorities.SharedEntryContactPlugin
    });
};

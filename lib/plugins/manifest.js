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
const { WebpackManifestPlugin } = require('../webpack-manifest-plugin');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');
const copyEntryTmpName = require('../utils/copyEntryTmpName');
const manifestKeyPrefixHelper = require('../utils/manifest-key-prefix-helper');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    const manifestPluginOptions = {
        seed: {},
        basePath: manifestKeyPrefixHelper(webpackConfig),
        // always write a manifest.json file, even with webpack-dev-server
        writeToFileEmit: true,
        filter: (file) => {
            const isCopyEntry = file.isChunk && copyEntryTmpName === file.chunk.id;
            const isStyleEntry = file.isChunk && webpackConfig.styleEntries.has(file.chunk.name);
            const isJsOrJsMapFile = /\.js(\.map)?$/.test(file.name);

            return !isCopyEntry && !(isStyleEntry && isJsOrJsMapFile);
        }
    };

    plugins.push({
        plugin: new WebpackManifestPlugin(
            applyOptionsCallback(webpackConfig.manifestPluginOptionsCallback, manifestPluginOptions)
        ),
        priority: PluginPriorities.WebpackManifestPlugin
    });
};

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const ManifestPlugin = require('webpack-manifest-plugin');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');
const sharedEntryTmpName = require('../utils/sharedEntryTmpName');
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
            return (!file.isChunk || file.chunk.id !== sharedEntryTmpName);
        }
    };

    plugins.push({
        plugin: new ManifestPlugin(
            applyOptionsCallback(webpackConfig.manifestPluginOptionsCallback, manifestPluginOptions)
        ),
        priority: PluginPriorities.WebpackManifestPlugin
    });
};

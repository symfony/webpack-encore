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
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
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
    let manifestPluginOptions = {
        seed: {},
        basePath: manifestKeyPrefixHelper(webpackConfig),
        // always write a manifest.json file, even with webpack-dev-server
        writeToFileEmit: true,
        filter: (file) => {
            const isCopyEntry = file.isChunk && copyEntryTmpName === file.chunk.id;
            const isStyleEntry = file.isChunk && webpackConfig.styleEntries.has(file.chunk.name);
            const isJsOrJsMapFile = /\.js(\.map)?$/.test(file.name);

            return !isCopyEntry && !(isStyleEntry && isJsOrJsMapFile);
        },
        map: (file) => {
            if (webpackConfig.useVersioning) {
                // Remove hash in manifest key
                file.name = file.name.replace(/(\.[a-f0-9]{8})(\..*)$/, '$2');
            }

            return file;
        },
    };

    manifestPluginOptions = applyOptionsCallback(
        webpackConfig.manifestPluginOptionsCallback,
        manifestPluginOptions
    );

    const userMapOption = manifestPluginOptions.map;
    manifestPluginOptions.map = (file) => {
        const newFile = Object.assign({}, file, {
            name: file.name.replace('?copy-files-loader', ''),
        });

        if (typeof userMapOption === 'function') {
            return userMapOption(newFile);
        }

        return newFile;
    };

    plugins.push({
        plugin: new WebpackManifestPlugin(manifestPluginOptions),
        priority: PluginPriorities.WebpackManifestPlugin
    });
};

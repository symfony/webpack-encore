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

import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import PluginPriorities from './plugin-priorities.js';
import applyOptionsCallback from '../utils/apply-options-callback.js';
import copyEntryTmpName from '../utils/copyEntryTmpName.js';
import manifestKeyPrefixHelper from '../utils/manifest-key-prefix-helper.js';

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
export default function(plugins, webpackConfig) {
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
        }
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
}

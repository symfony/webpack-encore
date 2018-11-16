/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const PluginPriorities = require('./plugin-priorities');
const sharedEntryTmpName = require('../utils/sharedEntryTmpName');
const copyEntryTmpName = require('../utils/copyEntryTmpName');
const AssetsPlugin = require('assets-webpack-plugin');

/**
 * @param {object} assets
 * @param {Map} entriesOptions
 * @return {string}
 */
function processOutput(assets, entriesOptions) {
    for (const entry of [copyEntryTmpName, sharedEntryTmpName]) {
        delete assets[entry];
    }

    // with --watch or dev-server, subsequent calls will include
    // the original assets (so, assets.entrypoints) + the new
    // assets (which will have their original structure). We
    // delete the entrypoints key, and then process the new assets
    // like normal below
    delete assets.entrypoints;
    delete assets.metadata;

    // This will iterate over all the entry points and remove the / from the start of the paths. It also converts the
    // one file entries into an array of one entry since that was how the entry point file was before this change.
    for (const asset in assets) {
        for (const fileType in assets[asset]) {
            if (!Array.isArray(assets[asset][fileType])) {
                assets[asset][fileType] = [assets[asset][fileType]];
            }

            assets[asset][fileType] = assets[asset][fileType].map(buildPath => buildPath.replace(/^\//g, ''));
        }
    }

    const metadata = {
        entrypoints: {}
    };
    for (const [entryName, entryOptions] of entriesOptions) {
        const options = {};

        if (entryOptions.preload) {
            options.hint = 'preload';
        } else if (entryOptions.prefetch) {
            options.hint = 'prefetch';
        }

        if (entryOptions.async) {
            options.attributes = { async: true };
        } else if (entryOptions.defer) {
            options.attributes = { defer: true };
        }

        if (0 === Object.keys(options).length) {
            continue;
        }

        metadata.entrypoints[entryName] = options;
    }

    return JSON.stringify({
        entrypoints: assets,
        metadata: metadata
    }, null, 2);
}

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    plugins.push({
        plugin: new AssetsPlugin({
            path: webpackConfig.outputPath,
            filename: 'entrypoints.json',
            includeAllFileTypes: true,
            entrypoints: true,
            processOutput: assets => {
                return processOutput(assets, webpackConfig.entryOptions);
            }
        }),
        priority: PluginPriorities.AssetsPlugin
    });
};

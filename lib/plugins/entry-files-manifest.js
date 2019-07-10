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
const PluginPriorities = require('./plugin-priorities');
const sharedEntryTmpName = require('../utils/sharedEntryTmpName');
const copyEntryTmpName = require('../utils/copyEntryTmpName');
const AssetsPlugin = require('assets-webpack-plugin');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function processOutput(webpackConfig) {
    return (assets) => {
        for (const entry of [copyEntryTmpName, sharedEntryTmpName]) {
            delete assets[entry];
        }

        // with --watch or dev-server, subsequent calls will include
        // the original assets (so, assets.entrypoints) + the new
        // assets (which will have their original structure). We
        // delete the entrypoints key, and then process the new assets
        // like normal below. The same reasoning applies to the
        // integrity key.
        delete assets.entrypoints;
        delete assets.integrity;

        // This will iterate over all the entry points and convert the
        // one file entries into an array of one entry since that was how the entry point file was before this change.
        const integrity = {};
        const integrityAlgorithms = webpackConfig.integrityAlgorithms;
        const publicPath = webpackConfig.getRealPublicPath();

        for (const asset in assets) {
            for (const fileType in assets[asset]) {
                if (!Array.isArray(assets[asset][fileType])) {
                    assets[asset][fileType] = [assets[asset][fileType]];
                }

                if (integrityAlgorithms.length) {
                    for (const file of assets[asset][fileType]) {
                        if (file in integrity) {
                            continue;
                        }

                        const filePath = path.resolve(
                            webpackConfig.outputPath,
                            file.replace(publicPath, '')
                        );

                        if (fs.existsSync(filePath)) {
                            const fileHashes = [];

                            for (const algorithm of webpackConfig.integrityAlgorithms) {
                                const hash = crypto.createHash(algorithm);
                                const fileContent = fs.readFileSync(filePath, 'utf8');
                                hash.update(fileContent, 'utf8');

                                fileHashes.push(`${algorithm}-${hash.digest('base64')}`);
                            }

                            integrity[file] = fileHashes.join(' ');
                        }
                    }
                }
            }
        }

        const manifestContent = { entrypoints: assets };
        if (integrityAlgorithms.length) {
            manifestContent.integrity = integrity;
        }

        return JSON.stringify(manifestContent, null, 2);
    };
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
            processOutput: processOutput(webpackConfig)
        }),
        priority: PluginPriorities.AssetsPlugin
    });
};

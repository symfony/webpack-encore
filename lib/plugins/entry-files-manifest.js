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

function processOutput(assets) {
    if (assets.hasOwnProperty(copyEntryTmpName)) {
        delete assets[copyEntryTmpName];
    }
    if (assets.hasOwnProperty(sharedEntryTmpName)) {
        delete assets[sharedEntryTmpName];
    }
    // This will iterate over all the entry points and remove the / from the start of the paths. It also converts the
    // one file entries into an array of one entry since that was how the entry point file was before this change.
    for (const asset in assets) {
        for (const fileType in assets[asset]) {
            if (Array.isArray(assets[asset][fileType])) {
                assets[asset][fileType] = assets[asset][fileType].map(buildPath => buildPath.replace(/^\//g, ''));
            } else {
                assets[asset][fileType] = [assets[asset][fileType].replace(/^\//g, '')];
            }
        }
    }
    return JSON.stringify(assets);
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
            processOutput: processOutput
        }),
        priority: PluginPriorities.AssetsPlugin
    });
};

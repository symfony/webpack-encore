/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

/**
 * @import WebpackConfig from '../WebpackConfig'
 */

const PluginPriorities = require('./plugin-priorities');
const copyEntryTmpName = require('../utils/copyEntryTmpName');
const AssetsPlugin = require('assets-webpack-plugin');
const fs = require('fs');
const path = require('path');
const featuresHelper = require("../features");

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (webpackConfig.useIntegrity) {
        featuresHelper.ensurePackagesExistAndAreCorrectVersion('integrity')
    }

    plugins.push({
        plugin: new AssetsPlugin({
            path: webpackConfig.outputPath,
            filename: 'entrypoints.json',
            includeAllFileTypes: true,
            entrypoints: true,
            integrity: webpackConfig.useIntegrity,
            prettyPrint: true,
        }),
        priority: PluginPriorities.AssetsPlugin
    });

    if (webpackConfig.useIntegrity) {
        const {SubresourceIntegrityPlugin} = require('webpack-subresource-integrity');

        plugins.push({
            plugin: new SubresourceIntegrityPlugin({
                hashFuncNames: webpackConfig.integrityAlgorithms,
                enabled: true,
            }),
            priority: PluginPriorities.SubresourceIntegrityPlugin
        });
    }
};

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

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {

    let manifestPrefix = webpackConfig.manifestKeyPrefix;
    if (null === manifestPrefix) {
        // by convention, we remove the opening slash on the manifest keys
        manifestPrefix = webpackConfig.publicPath.replace(/^\//, '');
    }

    const manifestPluginOptions = {
        basePath: manifestPrefix,
        // always write a manifest.json file, even with webpack-dev-server
        writeToFileEmit: true,
    };

    plugins.push({
        plugin: new ManifestPlugin(
            applyOptionsCallback(webpackConfig.manifestPluginOptionsCallback, manifestPluginOptions)
        ),
        priority: PluginPriorities.WebpackManifestPlugin
    });
};

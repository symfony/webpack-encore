/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const ManifestPlugin = require('../webpack/webpack-manifest-plugin');
const PluginPriorities = require('./plugin-priorities');

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
        // guarantee the value uses the public path (or CDN public path)
        publicPath: webpackConfig.getRealPublicPath(),
        // always write a manifest.json file, even with webpack-dev-server
        writeToFileEmit: true,
    };

    webpackConfig.manifestPluginOptionsCallback.apply(
        manifestPluginOptions,
        [manifestPluginOptions]
    );

    plugins.push({
        plugin: new ManifestPlugin(manifestPluginOptions),
        priority: PluginPriorities.WebpackManifestPlugin
    });
};

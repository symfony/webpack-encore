/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderFeatures = require('../features');
const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
module.exports = function(plugins, webpackConfig) {

    if (!webpackConfig.useBrowserSync) {
        return;
    }

    loaderFeatures.ensurePackagesExistAndAreCorrectVersion('browsersync');
    const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

    let browserSyncOptions = {
        files: [
            {
                match: webpackConfig.browserSyncOptions.paths,
                fn: function(event, file) {
                    if (event === 'change') {
                        // get the named instance
                        const bs = require('browser-sync').get('bs-webpack-plugin');
                        bs.reload();
                    }
                }
            }
        ]
    };

    let browserSyncPluginOptions = {
        reload: false,
        name: 'bs-webpack-plugin' // same as used require('browser-sync').get()
    };

    // allow to overwrite values by user
    webpackConfig.browserSyncOptionsCallback.apply(null,
        [browserSyncOptions, browserSyncPluginOptions]
    );

    webpackConfig.plugins.push({
        plugin: new BrowserSyncPlugin(browserSyncOptions, browserSyncPluginOptions),
        priority: PluginPriorities.BrowserSyncPlugin
    });
};

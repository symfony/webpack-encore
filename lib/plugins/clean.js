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
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * Updates plugins array passed adding CleanWebpackPlugin instance
 *
 * @param {Array} plugins to push to
 * @param {WebpackConfig} webpackConfig read only variable
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {

    if (!webpackConfig.cleanupOutput) {
        return;
    }

    const cleanWebpackPluginOptions = {
        verbose: false,
        cleanOnceBeforeBuildPatterns: webpackConfig.cleanWebpackPluginPaths,
        // disabled to avoid a bug where some files were incorrectly deleted on watch rebuild
        cleanStaleWebpackAssets: false
    };

    plugins.push({
        plugin: new CleanWebpackPlugin(
            applyOptionsCallback(webpackConfig.cleanWebpackPluginOptionsCallback, cleanWebpackPluginOptions)
        ),
        priority: PluginPriorities.CleanWebpackPlugin
    });
};

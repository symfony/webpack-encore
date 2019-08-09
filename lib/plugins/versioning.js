/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');
const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const PluginPriorities = require('./plugin-priorities');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {

    /*
     * With versioning, the "contenthash" used in the filenames and
     * the module ids (i.e. the internal names of modules that
     * are required) become important. Specifically:
     *
     * 1) If the contents of a module don't change, then you don't want its
     *    internal module id to change. Otherwise, whatever file holds the
     *    webpack "manifest" will change because the module id will change.
     *    Solved by HashedModuleIdsPlugin or NamedModulesPlugin
     *
     * 2) Similarly, if the final contents of a file don't change,
     *    then we also don't want that file to have a new filename.
     *    The "contenthash" handles this.
     */
    if (webpackConfig.isProduction()) {
        // shorter, and obfuscated module ids (versus named modules)
        // makes the final assets *slightly* larger, but prevents contents
        // from sometimes changing when nothing really changed
        // Note: Should not be needed in Webpack 5:
        // https://github.com/webpack/webpack/pull/8276
        plugins.push({
            plugin: new webpack.HashedModuleIdsPlugin(),
            priority: PluginPriorities.HashedModuleIdsPlugin
        });
    } else {
        // No plugin is added. But, see the "optimizations" config,
        // for inclusion of the "named modules".
    }
};

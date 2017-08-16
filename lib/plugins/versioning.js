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
const WebpackChunkHash = require('webpack-chunk-hash');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {

    /*
     * With versioning, the "chunkhash" used in the filenames and
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
     *    The WebpackChunkHash() handles this, by making sure that
     *    the chunkhash is based off of the file contents.
     *
     * Even in the webpack community, the ideal setup seems to be
     * a bit of a mystery:
     *  * https://github.com/webpack/webpack/issues/1315
     *  * https://github.com/webpack/webpack.js.org/issues/652#issuecomment-273324529
     *  * https://webpack.js.org/guides/caching/#deterministic-hashes
     */
    if (webpackConfig.isProduction()) {
        // shorter, and obfuscated module ids (versus NamedModulesPlugin)
        // makes the final assets *slightly* larger, but prevents contents
        // from sometimes changing when nothing really changed
        plugins.push(new webpack.HashedModuleIdsPlugin());
    } else {
        // human-readable module names, helps debug in HMR
        // enable always when not in production for consistency
        plugins.push(new webpack.NamedModulesPlugin());
    }

    if (webpackConfig.useVersioning) {
        // enables the [chunkhash] ability
        plugins.push(new WebpackChunkHash());
    }
};

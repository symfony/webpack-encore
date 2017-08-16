/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');

module.exports = {
    /**
     * Determines the "contentBase" to use for the devServer.
     *
     * @param {WebpackConfig} webpackConfig
     * @return {String}
     */
    getContentBase(webpackConfig) {
        // strip trailing slash (for Unix or Windows)
        const outputPath = webpackConfig.outputPath.replace(/\/$/,'').replace(/\\$/, '');
        // use the manifestKeyPrefix if available
        const publicPath = webpackConfig.manifestKeyPrefix ? webpackConfig.manifestKeyPrefix.replace(/\/$/,'') : webpackConfig.publicPath.replace(/\/$/,'');

        /*
         * We use the intersection of the publicPath (or manifestKeyPrefix) and outputPath
         * to determine the "document root" of the web server. For example:
         *   * outputPath = /var/www/public/build
         *   * publicPath = /build/
         *      => contentBase should be /var/www/public
         *
         * At this point, if the publicPath is non-standard (e.g. it contains
         * a sub-directory or is absolute), then the user will already see
         * an error that they must set the manifestKeyPrefix.
         */

        // start with outputPath, then join publicPath with it, see if it equals outputPath
        // in loop, do dirname on outputPath and repeat
        // eventually, you (may) get to the right path
        let contentBase = outputPath;
        while (path.dirname(contentBase) !== contentBase) {
            if (path.join(contentBase, publicPath) === outputPath) {
                return contentBase;
            }

            // go up one directory
            contentBase = path.dirname(contentBase);
        }

        throw new Error(`Unable to determine contentBase option for webpack's devServer configuration. The ${webpackConfig.manifestKeyPrefix ? 'manifestKeyPrefix' : 'publicPath'} (${webpackConfig.manifestKeyPrefix ? webpackConfig.manifestKeyPrefix : webpackConfig.publicPath}) string does not exist in the outputPath (${webpackConfig.outputPath}), and so the "document root" cannot be determined.`);
    },

    /**
     * Returns the output path, but as a relative string (e.g. web/build)
     *
     * @param {WebpackConfig} webpackConfig
     * @return {String}
     */
    getRelativeOutputPath(webpackConfig) {
        return webpackConfig.outputPath.replace(webpackConfig.getContext() + path.sep, '');
    },

    /**
     * If the manifestKeyPrefix is not set, this uses the publicPath to generate it.
     *
     * Most importantly, this runs some sanity checks to make sure that it's
     * ok to use the publicPath as the manifestKeyPrefix.
     *
     * @param {WebpackConfig} webpackConfig
     * @return {void}
     */
    validatePublicPathAndManifestKeyPrefix(webpackConfig) {
        if (webpackConfig.manifestKeyPrefix !== null) {
            // nothing to check - they have manually set the key prefix
            return;
        }

        if (webpackConfig.publicPath.includes('://')) {
            /*
             * If publicPath is absolute, you probably don't want your manifests.json
             * keys to be prefixed with the CDN URL. Instead, we force you to
             * choose your manifestKeyPrefix.
             */

            throw new Error('Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. build/) to use when building your manifest keys. This is happening because you passed an absolute URL to setPublicPath().');
        }

        let outputPath = webpackConfig.outputPath;
        // for comparison purposes, change \ to / on Windows
        outputPath = outputPath.replace(/\\/g, '/');

        // remove trailing slash on each
        outputPath = outputPath.replace(/\/$/, '');
        const publicPath = webpackConfig.publicPath.replace(/\/$/, '');

        /*
         * This is a sanity check. If, for example, you are deploying
         * to a subdirectory, then you might have something like this:
         *      outputPath = /var/www/public/build
         *      publicPath = /subdir/build/
         *
         * In that case, you probably don't want the keys in the manifest.json
         * file to be prefixed with /subdir/build - it makes more sense
         * to prefix them with /build, which is the true prefix relative
         * to your application (the subdirectory is a deployment detail).
         *
         * For that reason, we force you to choose your manifestKeyPrefix().
         */
        if (outputPath.indexOf(publicPath) === -1) {
            const suggestion = publicPath.substr(publicPath.lastIndexOf('/') + 1) + '/';

            throw new Error(`Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. ${suggestion}) to use when building your manifest keys. This is caused by setOutputPath() (${outputPath}) and setPublicPath() (${publicPath}) containing paths that don't seem compatible.`);
        }
    }
};

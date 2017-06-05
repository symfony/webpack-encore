/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

class Validator {
    /**
     * @param {WebpackConfig} webpackConfig
     */
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    validate() {
        this._validateBasic();

        this._validatePublicPathConfig();

        this._validateDevServer();
    }

    _validateBasic() {
        if (this.webpackConfig.outputPath === null) {
            throw new Error('Missing output path: Call setOutputPath() to control where the files will be written.');
        }

        if (this.webpackConfig.publicPath === null) {
            throw new Error('Missing public path: Call setPublicPath() to control the public path relative to where the files are written (the output path).');
        }

        if (this.webpackConfig.entries.size === 0 && this.webpackConfig.styleEntries.size === 0) {
            throw new Error('No entries found! You must call addEntry() or addStyleEntry() at least once - otherwise... there is nothing to webpack!');
        }
    }

    _validatePublicPathConfig() {
        if (this.webpackConfig.publicPath.includes('://') && !this.webpackConfig.manifestKeyPrefix) {
            /*
             * If publicPath is absolute, you probably don't want your manifests.json
             * keys to be prefixed with the CDN URL. Instead, we force you to
             * choose your manifestKeyPrefix.
             */

            throw new Error('Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. build/) to use when building your manifest keys. This is happening because you passed an absolute URL to setPublicPath().');
        }

        if (!this.webpackConfig.manifestKeyPrefix) {
            const outputPath = this.webpackConfig.outputPath.replace(/\/$/, '');
            const publicPath = this.webpackConfig.publicPath.replace(/\/$/, '');

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

                throw new Error(`Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. ${suggestion}) to use when building your manifest keys. This is caused by setOutputPath() and setPublicPath() containing paths that don't seem compatible.`);
            }
        }
    }

    _validateDevServer() {
        if (this.webpackConfig.useVersioning && this.webpackConfig.useDevServer()) {
            throw new Error('Don\'t enable versioning with the dev-server. A good setting is Encore.enableVersioning(Encore.isProduction()).');
        }
    }
}

module.exports = function(webpackConfig) {
    const validator = new Validator(webpackConfig);

    validator.validate(webpackConfig);
};

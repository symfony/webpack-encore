/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const pathUtil = require('./path-util');
const logger = require('./../logger');

class Validator {
    /**
     * @param {WebpackConfig} webpackConfig
     */
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    validate() {
        this._validateBasic();

        this._validatePublicPathAndManifestKeyPrefix();

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

    _validatePublicPathAndManifestKeyPrefix() {
        pathUtil.validatePublicPathAndManifestKeyPrefix(this.webpackConfig);
    }

    _validateDevServer() {
        if (!this.webpackConfig.useDevServer()) {
            return;
        }

        if (this.webpackConfig.useVersioning) {
            throw new Error('Don\'t enable versioning with the dev-server. A good setting is Encore.enableVersioning(Encore.isProduction()).');
        }

        /*
         * An absolute publicPath is incompatible with webpackDevServer.
         * This is because we want to *change* the publicPath to point
         * to the webpackDevServer URL (e.g. http://localhost:8080/).
         * There are some valid use-cases for not wanting this behavior
         * (see #59), but we want to warn the user.
         */
        if (this.webpackConfig.publicPath.includes('://')) {
            logger.warning(`Passing an absolute URL to setPublicPath() *and* using the dev-server can cause issues. Your assets will load from the publicPath (${this.webpackConfig.publicPath}) instead of from the dev server URL (${this.webpackConfig.runtimeConfig.devServerUrl}).`);
        }
    }
}

module.exports = function(webpackConfig) {
    const validator = new Validator(webpackConfig);

    validator.validate(webpackConfig);
};

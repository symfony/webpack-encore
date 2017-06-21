/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const pathUtil = require('./path-util');

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
        if (this.webpackConfig.useVersioning && this.webpackConfig.useDevServer()) {
            throw new Error('Don\'t enable versioning with the dev-server. A good setting is Encore.enableVersioning(Encore.isProduction()).');
        }
    }
}

module.exports = function(webpackConfig) {
    const validator = new Validator(webpackConfig);

    validator.validate(webpackConfig);
};

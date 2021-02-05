/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

class RuntimeConfig {
    constructor() {
        this.command = null;
        this.context = null;
        this.isValidCommand = false;
        this.environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

        this.useDevServer = false;
        this.devServerHttps = null;
        // see config-generator - getWebpackConfig()
        this.devServerFinalIsHttps = null;
        this.devServerHost = null;
        this.devServerPort = null;
        this.devServerPublic = null;
        this.devServerKeepPublicPath = false;
        this.outputJson = false;
        this.profile = false;

        this.babelRcFileExists = null;

        this.helpRequested = false;
        this.verbose = false;
    }
}

module.exports = RuntimeConfig;

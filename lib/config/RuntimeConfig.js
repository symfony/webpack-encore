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

        this.useDevServer = null;
        this.devServerUrl = null;
        this.devServerHttps = null;
        this.devServerKeepPublicPath = false;
        this.useHotModuleReplacement = null;

        this.babelRcFileExists = null;

        this.helpRequested = false;
        this.verbose = false;
    }
}

module.exports = RuntimeConfig;

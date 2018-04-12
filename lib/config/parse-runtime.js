/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const RuntimeConfig = require('./RuntimeConfig');
const pkgUp = require('pkg-up');
const path = require('path');
const resolveRc = require('babel-loader/lib/resolve-rc');

/**
 * @param {object} argv
 * @param {String} cwd
 * @returns {RuntimeConfig}
 */
module.exports = function(argv, cwd) {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.command = argv._[0];
    runtimeConfig.useDevServer = false;
    runtimeConfig.useHotModuleReplacement = false;
    runtimeConfig.outputJson = false;
    runtimeConfig.profile = false;

    switch (runtimeConfig.command) {
        case 'dev':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'dev';
            runtimeConfig.verbose = true;
            break;
        case 'production':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'production';
            runtimeConfig.verbose = false;
            break;
        case 'dev-server':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'dev';
            runtimeConfig.verbose = true;

            runtimeConfig.useDevServer = true;
            runtimeConfig.devServerHttps = argv.https;
            runtimeConfig.useHotModuleReplacement = argv.hot || false;
            runtimeConfig.devServerKeepPublicPath = argv.keepPublicPath || false;

            var host = argv.host ? argv.host : 'localhost';
            var port = argv.port ? argv.port : '8080';
            runtimeConfig.devServerUrl = `http${runtimeConfig.devServerHttps ? 's' : ''}://${host}:${port}/`;

            break;
    }

    runtimeConfig.context = argv.context;
    if (typeof runtimeConfig.context === 'undefined') {
        const packagesPath = pkgUp.sync(cwd);

        if (null === packagesPath) {
            throw new Error('Cannot determine webpack context. (Are you executing webpack from a directory outside of your project?). Try passing the --context option.');
        }

        runtimeConfig.context = path.dirname(packagesPath);
    }

    if (argv.h || argv.help) {
        runtimeConfig.helpRequested = true;
    }

    if (argv.j || argv.json) {
        runtimeConfig.outputJson = true;
    }

    if (argv.profile) {
        runtimeConfig.profile = true;
    }

    runtimeConfig.babelRcFileExists = (typeof resolveRc(require('fs'), runtimeConfig.context)) !== 'undefined';

    return runtimeConfig;
};

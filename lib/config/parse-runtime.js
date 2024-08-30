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
const packageUp = require('../utils/package-up');
const path = require('path');
const babel = require('@babel/core');

/**
 * @param {object} argv
 * @param {string} cwd
 * @returns {RuntimeConfig}
 */
module.exports = function(argv, cwd) {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.command = argv._[0];

    switch (runtimeConfig.command) {
        case 'dev':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'dev';
            runtimeConfig.verbose = true;
            break;
        case 'production':
        case 'prod':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'production';
            runtimeConfig.verbose = false;
            break;
        case 'dev-server':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'dev';
            runtimeConfig.verbose = true;

            runtimeConfig.useDevServer = true;
            runtimeConfig.devServerKeepPublicPath = argv.keepPublicPath || false;

            if (argv.https || argv.serverType === 'https') {
                runtimeConfig.devServerHttps = true;
            }

            if (typeof argv.public === 'string') {
                runtimeConfig.devServerPublic = argv.public;
            }

            runtimeConfig.devServerHost = argv.host ? argv.host : 'localhost';
            runtimeConfig.devServerPort = argv.port ? argv.port : '8080';

            break;
    }

    runtimeConfig.context = argv.context;
    if (typeof runtimeConfig.context === 'undefined') {
        const packagesPath = packageUp({ cwd });

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

    const partialConfig = babel.loadPartialConfig({
        /*
         * There are two types of babel configuration:
         * - project-wide configuration in babel.config.* files
         * - file-relative configuration in .babelrc.* files
         *   or package.json files with a "babel" key
         *
         * To detect the file-relative configuration we need
         * to set the following values. The filename is needed
         * for Babel as an example so that it knows where it
         * needs to search the relative config for.
         */
        root: cwd,
        cwd: cwd,
        filename: path.join(cwd, 'webpack.config.js')
    });
    runtimeConfig.babelRcFileExists = partialConfig.hasFilesystemConfig();

    return runtimeConfig;
};

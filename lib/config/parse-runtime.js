/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import path from 'path';

import packageUp from '../utils/package-up.js';
import RuntimeConfig from './RuntimeConfig.js';

/**
 * @param {object} argv
 * @param {string} cwd
 * @returns {RuntimeConfig}
 */
export default function (argv, cwd) {
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

            if (typeof argv.public === 'string') {
                runtimeConfig.devServerPublic = argv.public;
            }

            runtimeConfig.devServerHost = argv.host ? argv.host : 'localhost';
            runtimeConfig.devServerPort = argv.port ? argv.port : '8080';

            if (argv.serverType) {
                runtimeConfig.devServerServerType = argv.serverType;
            }

            break;
    }

    runtimeConfig.context = argv.context;
    if (typeof runtimeConfig.context === 'undefined') {
        const packagesPath = packageUp({ cwd });

        if (null === packagesPath) {
            throw new Error(
                'Cannot determine webpack context. (Are you executing webpack from a directory outside of your project?). Try passing the --context option.'
            );
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

    // babelRcFileExists detection is deferred to build time
    // (handled lazily by WebpackConfig.doesBabelRcFileExist())

    return runtimeConfig;
}

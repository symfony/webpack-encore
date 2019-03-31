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
const babel = require('@babel/core');

/**
 * @param {object} argv
 * @param {String} cwd
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
            runtimeConfig.devServerHttps = argv.https;
            runtimeConfig.useHotModuleReplacement = argv.hot || false;
            runtimeConfig.devServerKeepPublicPath = argv.keepPublicPath || false;

            if (typeof argv.public === 'string') {
                if (argv.public.includes('://')) {
                    runtimeConfig.devServerUrl = argv.public;
                } else if (runtimeConfig.devServerHttps) {
                    runtimeConfig.devServerUrl = `https://${argv.public}`;
                } else {
                    runtimeConfig.devServerUrl = `http://${argv.public}`;
                }
            } else {
                var host = argv.host ? argv.host : 'localhost';
                var port = argv.port ? argv.port : '8080';
                runtimeConfig.devServerUrl = `http${runtimeConfig.devServerHttps ? 's' : ''}://${host}:${port}/`;
            }

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

    const partialConfig = babel.loadPartialConfig({
        /*
         * This is a small mystery. Even if we set the cwd & root
         * options, deep in babel, if the filename option is not
         * set, then it doesn't see the "cwd" directory as a valid
         * directory where it should look for the .babelrc file.
         * The fact that this is set to webpack.config.js is not
         * significant at all - you could even invent a filename.
         * However, as I'm not sure the side effects (the filename
         * option is documented as "for error messages"), we're
         * setting it to a realistic filename.
         */
        root: cwd,
        cwd: cwd,
        filename: path.join(cwd, 'webpack.config.js')
    });
    runtimeConfig.babelRcFileExists = (typeof partialConfig.babelrc === 'string');

    return runtimeConfig;
};

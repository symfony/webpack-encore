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
        case 'init':
            // todo - document this command
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'dev';
            runtimeConfig.verbose = true;
            runtimeConfig.runGenerator = true;

            /*
             * 1) Are you building a single-page app or will you have multiple pages?
             *
             * ## IF SPA
             *
             *      2a) What type of JavaScript will your SPA use?
             *          * Vanilla JavaScript with jQuery
             *          * Vue.js
             *          * React
             *
             *      2b) What type of CSS do you want to write?
             *          * Vanilla CSS
             *          * Sass
             *          * Less
             *
             *      -> generate an app.js entry with a small skeleton
             *      -> tell the user what link/script tags to include
             *      -> run yarn for them?
             *
             * ## IF MULTI
             *
             *      2a) What type of CSS do you want to write?
             *
             *      > Encore will generate an entry called "app"
             *          for your global JS and CSS.
             *
             *      -> generate app.js for layout stuff (shared entry)
             *      -> generate other entry with skeleton
             *      -> tell user they can now do whatever they want,
             *          or use add-entry to add more entries
             *
             * COMMENTS
             *  - give them a .postcss config file by default (and enable this)
             *  - ideally, we would run the `yarn add ... --dev` commands automatically
             *      for them to add what they need
             *  - for React & vue.js, we should try to use *their*
             *      official "skeletons" so that it feels like a very
             *      normal React or vue experience
             *  - should we install and include jQuery?
             */

            break;
        // case 'add-entry':
        //     // todo - document this command
        //     runtimeConfig.isValidCommand = true;
        //     runtimeConfig.environment = 'dev';
        //     runtimeConfig.verbose = true;
        //     break;
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

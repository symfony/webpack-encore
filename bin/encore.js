#!/usr/bin/env node
/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const parseRuntime = require('../lib/config/parse-runtime');
const context = require('../lib/context');
const pc = require('picocolors');
const logger = require('../lib/logger');
const featuresHelper = require("../lib/features");

const runtimeConfig = parseRuntime(
    require('yargs-parser')(process.argv.slice(2)),
    process.cwd()
);
context.runtimeConfig = runtimeConfig;

// prevent logs from being dumped
if (runtimeConfig.outputJson) {
    logger.quiet();
}

// remove the command from the input
process.argv.splice(2, 1);

// remove arguments not supported by webpack/-dev-server
const encoreOnlyArguments = new Set(['--keep-public-path']);
process.argv = process.argv.filter(arg => !encoreOnlyArguments.has(arg));

// remove argument --public not supported by webpack/dev-server
const indexPublicArgument = process.argv.indexOf('--public');
if (indexPublicArgument !== -1) {
    process.argv.splice(indexPublicArgument, 2);
}

if (!runtimeConfig.isValidCommand) {
    if (runtimeConfig.command) {
        console.log(pc.bgRed(pc.white(`Invalid command "${runtimeConfig.command}"`)));
        console.log();
    }
    showUsageInstructions();

    process.exit(1); // eslint-disable-line no-process-exit
}

if (runtimeConfig.helpRequested) {
    showUsageInstructions();

    // allow it to continue to the help command of webpack
}

if (runtimeConfig.useDevServer) {
    try {
        featuresHelper.ensurePackagesExistAndAreCorrectVersion('webpack-dev-server', 'the webpack Development Server');
    } catch (e) {
        console.log(e);
        process.exit(1);
    }

    console.log('Running webpack-dev-server ...');
    console.log();

    return require('webpack-dev-server/bin/webpack-dev-server');
} else {
    if (!runtimeConfig.outputJson) {
        console.log('Running webpack ...');
        console.log();
    }

    return require('webpack/bin/webpack');
}

function showUsageInstructions() {
    const validCommands = ['dev', 'prod', 'production', 'dev-server'];

    console.log(`usage ${pc.green('encore')} [${ validCommands.map(command => pc.green(command)).join('|') }]`);
    console.log();
    console.log('encore is a thin executable around the webpack or webpack-dev-server executables');
    console.log();
    console.log('Commands:');
    console.log(`    ${pc.green('dev')}        : runs webpack for development`);
    console.log('       - Supports any webpack options (e.g. --watch)');
    console.log();
    console.log(`    ${pc.green('dev-server')} : runs webpack-dev-server`);
    console.log(`       - ${pc.yellow('--host')} The hostname/ip address the webpack-dev-server will bind to`);
    console.log(`       - ${pc.yellow('--port')} The port the webpack-dev-server will bind to`);
    console.log(`       - ${pc.yellow('--keep-public-path')} Do not change the public path (it is usually prefixed by the dev server URL)`);
    console.log(`       - ${pc.yellow('--public')} The public url for entry asset in entrypoints.json`);
    console.log('       - Supports any webpack-dev-server options');
    console.log();
    console.log(`    ${pc.green('production')} : runs webpack for production`);
    console.log('       - Supports any webpack options (e.g. --watch)');
    console.log();
    console.log(pc.yellow('    encore dev --watch'));
    console.log(pc.yellow('    encore dev-server'));
    console.log(pc.yellow('    encore production'));
    console.log();
}

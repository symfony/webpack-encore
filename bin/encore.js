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
const chalk = require('chalk');

const runtimeConfig = parseRuntime(
    require('yargs/yargs')(process.argv.slice(2)).argv,
    process.cwd()
);
context.runtimeConfig = runtimeConfig;

// remove the command from the output
process.argv.splice(2, 1);

if (!runtimeConfig.isValidCommand) {
    if (runtimeConfig.command) {
        console.log(chalk.bgRed.white(`Invalid command "${runtimeConfig.command}"`));
        console.log();
    }
    showUsageInstructions();

    process.exit(1);
}

if (runtimeConfig.helpRequested) {
    showUsageInstructions();

    // allow it to continue to the help command of webpack
}

if (runtimeConfig.useDevServer) {
    console.log('Running webpack-dev-server ...');
    console.log();

    return require('webpack-dev-server/bin/webpack-dev-server');
} else {
    console.log('Running webpack ...');
    console.log();

    return require('webpack/bin/webpack');
}

function showUsageInstructions() {
    const validCommands = ['dev', 'production', 'dev-server'];

    console.log(`usage ${chalk.green('encore')} [${ validCommands.map(command => chalk.green(command)).join('|') }]`);
    console.log();
    console.log('encore is a thin executable around the webpack or webpack-dev-server executables');
    console.log();
    console.log('Commands:');
    console.log(`    ${chalk.green('dev')}        : runs webpack for development`);
    console.log('       - Supports any webpack options (e.g. --watch)');
    console.log();
    console.log(`    ${chalk.green('dev-server')} : runs webpack-dev-server`);
    console.log(`       - ${chalk.yellow('--host')} The hostname/ip address the webpack-dev-server will bind to`);
    console.log(`       - ${chalk.yellow('--port')} The port the webpack-dev-server will bind to`);
    console.log(`       - ${chalk.yellow('--hot')}  Enable HMR on webpack-dev-server`);
    console.log(`       - ${chalk.yellow('--keep-public-path')} Do not change the public path (it is usually prefixed by the dev server URL)`);
    console.log('       - Supports any webpack-dev-server options');
    console.log();
    console.log(`    ${chalk.green('production')} : runs webpack for production`);
    console.log('       - Supports any webpack options (e.g. --watch)');
    console.log();
    console.log(chalk.yellow('    encore dev --watch'));
    console.log(chalk.yellow('    encore dev-server'));
    console.log(chalk.yellow('    encore production'));
    console.log();
}

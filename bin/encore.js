#!/usr/bin/env node

const path = require('path');
const commandConfig = require('../lib/command-config');
const chalk = require('chalk');
const pkgUp = require('pkg-up');

const argv = require('yargs').argv;

const validCommands = ['dev', 'production', 'dev-server'];

const command = argv._[0];
// remove the command from the output
process.argv.splice(2, 1);
if (typeof command == 'undefined') {
    showUsageInstructions();

    process.exit(1);
}

commandConfig.useDevServer = false;
switch (command) {
    case 'dev':
        commandConfig.environment = 'dev';
        break;
    case 'production':
        commandConfig.environment = 'production';
        break;
    case 'dev-server':
        commandConfig.useDevServer = true;
        if (argv.host || argv.port) {
            const host = argv.host ? argv.host : 'localhost';
            const port = argv.port ? argv.port : '8080';

            commandConfig.devServerUrl = `http://${host}:${port}`;
        }
        commandConfig.environment = 'dev';

        break;
    default:
        console.log(chalk.bgRed.white(`Invalid command "${command}"`));
        console.log();
        showUsageInstructions();

        process.exit(1);
}

if (commandConfig.useDevServer) {
    console.log('Running webpack-dev-server ...');

    return require('webpack-dev-server/bin/webpack-dev-server');
} else {
    console.log('Running webpack ...');

    return require('webpack/bin/webpack');
}

function showUsageInstructions() {
    console.log(`usage ${chalk.green('encore')} [${ validCommands.map(command => chalk.green(command)).join('|') }]`);
    console.log();
    console.log('Commands:');
    console.log(`    ${chalk.green('dev')}        : runs webpack for development`);
    console.log('       - Supports any webpack options (e.g. --watch)');
    console.log(`    ${chalk.green('dev-server')} : runs webpack-dev-server`);
    console.log(`       - ${chalk.yellow('--host')} The hostname/ip address the webpack-dev-server will bind to`);
    console.log(`       - ${chalk.yellow('--port')} The port the webpack-dev-server will bind to`);
    console.log('       - Supports any webpack-dev-server options');
    console.log(`    ${chalk.green('production')} : runs webpack for production`);
    console.log('       - Supports any webpack options (e.g. --watch)');
    console.log();
    console.log(chalk.yellow('    encore dev --watch'));
    console.log(chalk.yellow('    encore dev-server'));
    console.log(chalk.yellow('    encore production'));
    console.log();
}


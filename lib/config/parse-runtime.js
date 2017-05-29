const RuntimeConfig = require('./RuntimeConfig');
const chalk = require('chalk');

/**
 * @param argv
 * @returns {RuntimeConfig}
 */
module.exports = function(argv) {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.command = argv._[0];
    runtimeConfig.useDevServer = false;

    switch (runtimeConfig.command) {
        case 'dev':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'dev';
            break;
        case 'production':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment ='production';
            break;
        case 'dev-server':
            runtimeConfig.isValidCommand = true;
            runtimeConfig.environment = 'dev';
            runtimeConfig.useDevServer = true;
            runtimeConfig.devServerHttps = argv.https;
            if (argv.host || argv.port) {
                const host = argv.host ? argv.host : 'localhost';
                const port = argv.port ? argv.port : '8080';

                runtimeConfig.devServerUrl = `http${runtimeConfig.devServerHttps ? 's' : ''}://${host}:${port}`;
            }

            break;
    }

    if (argv.h || argv.help) {
        runtimeConfig.helpRequested = true;
    }

    return runtimeConfig;
};

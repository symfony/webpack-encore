/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chalk = require('chalk');

const messagesKeys = [
    'debug',
    'recommendation',
    'warning',
    'deprecation',
];
const defaultConfig = {
    isVerbose: false,
    quiet: false
};

let messages = {};
let config = {};

const reset = function() {
    messages = {};
    for (let messageKey of messagesKeys) {
        messages[messageKey] = [];
    }
    config = Object.assign({}, defaultConfig);
};
reset();

function log(message) {
    if (config.quiet) {
        return;
    }

    console.log(message);
}

module.exports = {
    debug(message) {
        messages.debug.push(message);

        if (config.isVerbose) {
            log(`${chalk.bgBlack.white('   DEBUG   ')} ${message}`);
        }
    },

    recommendation(message) {
        messages.recommendation.push(message);

        log(`${chalk.bgBlue.white(' RECOMMEND ')} ${message}`);
    },

    warning(message) {
        messages.warning.push(message);

        log(`${chalk.bgYellow.black('  WARNING  ')} ${chalk.yellow(message)}`);
    },

    deprecation(message) {
        messages.deprecation.push(message);

        log(`${chalk.bgYellow.black('DEPRECATION')} ${chalk.yellow(message)}`);
    },

    getMessages() {
        return messages;
    },

    quiet(setQuiet = true) {
        config.quiet = setQuiet;
    },

    verbose(setVerbose = true) {
        config.isVerbose = setVerbose;
    },

    reset() {
        reset();
    }
};

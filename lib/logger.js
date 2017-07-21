/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chalk = require('chalk');
let isVerbose = false;
let quiet = false;
let messages = {
    debug: [],
    warning: [],
};

function log(message) {
    if (quiet) {
        return;
    }

    console.log(message);
}

module.exports = {
    debug(message) {
        messages.debug.push(message);

        if (isVerbose) {
            log(`${chalk.bgBlack.white(' DEBUG ')} ${message}`);
        }
    },

    warning(message) {
        messages.warning.push(message);

        log(`${chalk.bgYellow.black(' WARNING ')} ${chalk.yellow(message)}`);
    },

    clearMessages() {
        messages.debug = [];
        messages.warning = [];
    },

    getMessages() {
        return messages;
    },

    quiet() {
        quiet = true;
    },

    verbose() {
        isVerbose = true;
    }
};

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const logger = require('../../lib/logger');

function assertWarning(expectedMessage) {
    assertLogMessage(logger.getWarnings(), 'warning', expectedMessage);
}

function assertDeprecation(expectedMessage) {
    assertLogMessage(logger.getDeprecations(), 'deprecation', expectedMessage);
}

function assertLogMessage(messages, description, expectedMessage) {
    if (messages.length === 0) {
        throw new Error(`Found zero log ${description}s. And so, expected ${description} ${expectedMessage} was not logged.`);
    }

    let isFound = false;
    messages.forEach(function(message, index) {
        if (!isFound && message.includes(expectedMessage)) {
            isFound = true;
            // remove from the array now that it is found
            messages.splice(index, 1);
        }
    });

    if (!isFound) {
        throw new Error(`Did not find any log ${description}s matching ${expectedMessage}. Found: ${messages.join('\n')}`);
    }
}

module.exports = {
    assertWarning,
    assertDeprecation
};

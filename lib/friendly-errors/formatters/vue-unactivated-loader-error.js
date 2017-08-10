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

function formatErrors(errors) {
    if (errors.length === 0) {
        return [];
    }

    let messages = [];
    // there will be an error for *every* file, but showing
    // the error over and over again is not helpful

    messages.push(
        chalk.red('Vue processing failed:')
    );
    messages.push('');
    for (let error of errors) {
        messages.push(` * ${error.message}`);
    }

    messages.push('');

    return messages;
}

function format(errors) {
    return formatErrors(errors.filter((e) => (
        e.type === 'vue-unactivated-loader-error'
    )));
}

module.exports = format;

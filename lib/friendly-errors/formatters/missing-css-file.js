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

    messages.push(
        chalk.red('Module build failed: Module not found:')
    );
    for (let error of errors) {
        messages.push(`${error.file} contains a reference to the file ${error.ref}.`);
        messages.push('This file can not be found, please check it for typos or update it if the file got moved.');
        messages.push('');
    }

    return messages;
}

function format(errors) {
    return formatErrors(errors.filter((e) => (
        e.type === 'missing-css-file'
    )));
}

module.exports = format;

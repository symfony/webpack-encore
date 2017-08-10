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
        chalk.red('Module build failed: Error: No PostCSS Config found')
    );
    messages.push('');
    messages.push(`${chalk.bgGreen.black('', 'FIX', '')} Create a ${chalk.yellow('postcss.config.js')} file at the root of your project.`);
    messages.push('');
    messages.push('Here is an example to get you started!');
    messages.push(chalk.yellow(`
// postcss.config.js
module.exports = {
  plugins: {
    'autoprefixer': {},
  }
}
    `));

    messages.push('');
    messages.push('');

    return messages;
}

function format(errors) {
    return formatErrors(errors.filter((e) => (
        e.type === 'missing-postcss-config'
    )));
}

module.exports = format;

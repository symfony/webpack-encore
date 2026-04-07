/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pc from 'picocolors';

function formatErrors(errors) {
    if (errors.length === 0) {
        return [];
    }

    let messages = [];
    // there will be an error for *every* file, but showing
    // the error over and over again is not helpful

    messages.push(pc.red('Module build failed: Error: No PostCSS Config found'));
    messages.push('');
    messages.push(
        `${pc.bgGreen(pc.black('FIX'))} Create a PostCSS config file at the root of your project.`
    );
    messages.push('');
    messages.push('Here are two examples to get you started:');
    messages.push('');
    messages.push(pc.bold('Option 1: ESM') + ` (${pc.yellow('postcss.config.js')})`);
    messages.push(
        pc.yellow(`
export default {
  plugins: {
    'autoprefixer': {},
  }
}
    `)
    );
    messages.push(pc.bold('Option 2: CJS') + ` (${pc.yellow('postcss.config.cjs')})`);
    messages.push(
        pc.yellow(`
module.exports = {
  plugins: {
    'autoprefixer': {},
  }
}
    `)
    );

    return messages;
}

function format(errors) {
    return formatErrors(errors.filter((e) => e.type === 'missing-postcss-config'));
}

export default format;

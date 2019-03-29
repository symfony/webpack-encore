/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const PrettyError = require('pretty-error');

/**
 * Render a pretty version of the given error.
 *
 * Supported options:
 *      * {function} skipTrace
 *              An optional callback that defines whether
 *              or not each line of the eventual stacktrace
 *              should be kept. First argument is the content
 *              of the line, second argument is the line number.
 *
 * @param {*} error
 * @param {object} options
 *
 * @returns {void}
 */
module.exports = function(error, options = {}) {
    const pe = new PrettyError();

    // Use the default terminal's color
    // for the error message.
    pe.appendStyle({
        'pretty-error > header > message': { color: 'none' }
    });

    // Allow to skip some parts of the
    // stacktrace if there is one.
    if (options.skipTrace) {
        pe.skip(options.skipTrace);
    }

    console.log(pe.render(error));
};

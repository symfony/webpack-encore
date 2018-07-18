/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

/**
 * Function that escapes a string so it can be written into a
 * file surrounded by single quotes.
 *
 * This is imperfect - is used to escape a filename (so, mostly,
 * it needs to escape the Window path slashes).
 *
 * @param {string} str
 * @return {string}
 */
module.exports = function stringEscaper(str) {
    return str.replace(/\\/g, '\\\\').replace(/\x27/g, '\\\x27');
};

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
 * Function that escapes a string so it can be used in a RegExp.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 *
 * @param {string} str
 * @return {string}
 */
module.exports = function regexpEscaper(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

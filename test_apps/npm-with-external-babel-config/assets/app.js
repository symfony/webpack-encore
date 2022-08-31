/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

console.log('Hello world!');

function add(x, y) { return x + y; }
const addOne = add(1, ?);
console.log(addOne(2))

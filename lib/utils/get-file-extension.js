/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const url = require('url');

module.exports = function(filename) {
    const parsedFilename = new url.URL(filename, 'http://foo');
    const extension = path.extname(parsedFilename.pathname);
    return extension ? extension.slice(1) : '';
};

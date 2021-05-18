/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const { execSync } = require('child_process');
const { emptyTmpDir } = require('./test/helpers/setup');

emptyTmpDir();
for (let i = 0; i < 2; i++) {
    execSync('mocha --reporter spec test/persistent-cache --recursive', { stdio: 'inherit' });
}

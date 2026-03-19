/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { execSync } from 'child_process';
import { emptyTmpDir } from './test/helpers/setup.js';

emptyTmpDir();
for (let i = 0; i < 2; i++) {
    execSync('mocha --reporter spec test/persistent-cache --recursive', { stdio: 'inherit' });
}

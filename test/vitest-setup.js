/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { vi, beforeEach, afterEach } from 'vitest';
import logger from '../lib/logger.js';

beforeEach(() => {
    logger.reset();
});

afterEach(() => {
    vi.restoreAllMocks();
});

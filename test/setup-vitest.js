/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// Setup for Vitest - can be extended if needed
import { afterEach, vi } from 'vitest';

// Automatically restore all mocks after each test
afterEach(() => {
    vi.restoreAllMocks();
});


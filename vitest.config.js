/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.js'],
        exclude: ['test/helpers/**', 'test/vitest-global-setup.js', 'test/vitest-setup.js'],
        testTimeout: 10000,
        hookTimeout: 15000,
        globalSetup: ['./test/vitest-global-setup.js'],
        setupFiles: ['./test/vitest-setup.js'],
    },
    resolve: {
        conditions: ['node', 'node-addons'],
    },
});

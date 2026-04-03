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
        exclude: [
            'test/persistent-cache/**',
            'test/helpers/**',
            'test/setup-vitest.js',
        ],
        testTimeout: 10000,
        hookTimeout: 15000,
        setupFiles: ['./test/setup-vitest.js'],
    },
    resolve: {
        conditions: ['node', 'node-addons'],
    },
});

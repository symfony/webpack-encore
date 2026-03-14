/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { resolve as resolvePath } from 'path';
import { expect } from 'chai';
import packageUp from '../../lib/utils/package-up.js';

describe('package-up', function() {
    const test = {
        'package.json from Encore': {
            cwd: import.meta.dirname,
            expectedPath: resolvePath(import.meta.dirname, '../../package.json'),
        },
        'package.json from a subdirectory': {
            cwd: resolvePath(import.meta.dirname, '../../fixtures/stimulus/mock-module'),
            expectedPath: resolvePath(import.meta.dirname, '../../fixtures/stimulus/mock-module/package.json'),
        },
        'package.json from Encore when no package.json exists in the current directory': {
            cwd: resolvePath(import.meta.dirname, '../../fixtures'),
            expectedPath: resolvePath(import.meta.dirname, '../../package.json'),
        },
        'package.json from Encore when no package.json exists in the current directory (subdirectory)': {
            cwd: resolvePath(import.meta.dirname, '../../fixtures/copy'),
            expectedPath: resolvePath(import.meta.dirname, '../../package.json'),
        },
    };

    Object.entries(test).forEach(([description, { cwd, expectedPath }]) => {

        it(description, function() {
            expect(expectedPath).to.be.a('string');

            const path = packageUp({ cwd });

            expect(path).to.equal(expectedPath);
        });
    });
});

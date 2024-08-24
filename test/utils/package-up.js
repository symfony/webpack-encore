/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const { resolve: resolvePath } = require('path');
const expect = require('chai').expect;
const packageUp = require('../../lib/utils/package-up');

describe('package-up', () => {
    const test = {
        'package.json from Encore': {
            cwd: __dirname,
            expectedPath: resolvePath(__dirname, '../../package.json'),
        },
        'package.json from a subdirectory': {
            cwd: resolvePath(__dirname, '../../fixtures/stimulus/mock-module'),
            expectedPath: resolvePath(__dirname, '../../fixtures/stimulus/mock-module/package.json'),
        },
        'package.json from Encore when no package.json exists in the current directory': {
            cwd: resolvePath(__dirname, '../../fixtures'),
            expectedPath: resolvePath(__dirname, '../../package.json'),
        },
        'package.json from Encore when no package.json exists in the current directory (subdirectory)': {
            cwd: resolvePath(__dirname, '../../fixtures/copy'),
            expectedPath: resolvePath(__dirname, '../../package.json'),
        },
    };

    Object.entries(test).forEach(([description, { cwd, expectedPath }]) => {
        it(description, () => {
            expect(expectedPath).to.be.a('string');

            const path = packageUp({ cwd });

            expect(path).to.equal(expectedPath);
        });
    });
});

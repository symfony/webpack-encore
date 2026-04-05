/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import transform from '../../../lib/friendly-errors/transformers/missing-css-file.js';

describe('transform/missing-css-file', function() {

    describe('test transform', function() {
        it('Error not with "ModuleNotFoundError" name is ignored', function() {
            const startError = {
                name: 'OtherParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).toEqual(startError);
        });

        it('Error not containing "Module not found: Error: Can\'t resolve" is ignored', function() {
            const startError = {
                name: 'ModuleNotFoundError',
                message: 'Some other message',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).toEqual(startError);
        });

        it('Matching error is properly transformed', function() {
            const startError = {
                name: 'ModuleNotFoundError',
                message: 'Module build failed: ModuleNotFoundError: Module not found: Error: Can\'t resolve \'./../images/symfony_logo.png2\' in \'/Users/weaverryan/Sites/os/webpack-encore/tmp_project_playing/css\'',
                file: '/Users/weaverryan/Sites/os/webpack-encore/tmp_project_playing/css'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.ref).toEqual('./../images/symfony_logo.png2');
            expect(actualError.type).toEqual('missing-css-file');
            expect(actualError.file).toEqual('/Users/weaverryan/Sites/os/webpack-encore/tmp_project_playing/css');
        });
    });
});

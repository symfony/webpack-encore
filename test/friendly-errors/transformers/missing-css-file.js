/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const expect = require('chai').expect;
const transform = require('../../../lib/friendly-errors/transformers/missing-css-file');

describe('transform/missing-css-file', () => {

    describe('test transform', () => {
        it('Error not with "ModuleNotFoundError" name is ignored', () => {
            const startError = {
                name: 'OtherParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error not containing "Module not found: Error: Can\'t resolve" is ignored', () => {
            const startError = {
                name: 'ModuleNotFoundError',
                message: 'Some other message',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Matching error is properly transformed', () => {
            const startError = {
                name: 'ModuleNotFoundError',
                message: 'Module build failed: ModuleNotFoundError: Module not found: Error: Can\'t resolve \'./../images/symfony_logo.png2\' in \'/Users/weaverryan/Sites/os/webpack-encore/tmp_project_playing/css\'',
                file: '/Users/weaverryan/Sites/os/webpack-encore/tmp_project_playing/css'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.ref).to.deep.equal('./../images/symfony_logo.png2');
            expect(actualError.type).to.deep.equal('missing-css-file');
            expect(actualError.file).to.deep.equal('/Users/weaverryan/Sites/os/webpack-encore/tmp_project_playing/css');
        });
    });
});

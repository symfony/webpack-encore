/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const expect = require('chai').expect;
const transform = require('../../../lib/friendly-errors/transformers/missing-feature');

describe('transform/missing-loader', () => {

    describe('test transform', () => {
        it('Error with "ModuleParseError" name are transformed', () => {
            const startError = {
                name: 'OtherParseError',
                message: 'Module not found',
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error not containing "Module not found" is ignored', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'Some other message',
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Matching error is properly transformed', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'Module not found',
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.name).to.deep.equal('Feature not enabled');
            expect(actualError.type).to.deep.equal('feature-not-enabled');
            expect(actualError.featureName).to.deep.equal('typescriptforked');
        });
    });
});

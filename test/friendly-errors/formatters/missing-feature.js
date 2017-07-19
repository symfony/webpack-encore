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
const formatter = require('../../../lib/friendly-errors/formatters/missing-feature');

describe('formatters/missing-feature', () => {

    describe('test format()', () => {
        it('works with no errors', () => {
            const actualErrors = formatter([]);
            expect(actualErrors).to.be.empty;
        });

        it('errors without feature-not-enabled type are filtered', () => {
            const errors = [
                { type: 'feature-not-enabled', name: 'not-enabled.sass' },
                { type: 'other-type', name: 'other-type.sass' }
            ];

            const actualErrors = formatter(errors);
            expect(JSON.stringify(actualErrors)).to.contain('not-enabled.sass');
            expect(JSON.stringify(actualErrors)).to.not.contain('other-type.sass');
        });

        it('error is formatted correctly', () => {
            const error = {
                type: 'feature-not-enabled',
                file: '/some/file.sass',
                featureName: 'typescriptforked'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).to.contain('To check TypeScript types in a separate process');
            expect(JSON.stringify(actualErrors)).to.contain('Encore.enableForkedTypeScriptLoader()');
        });

        it('error is formatted correctly without featureName', () => {
            const error = {
                type: 'feature-not-enabled',
                name: 'Module not found'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).to.contain('To fix Module not found');
            expect(JSON.stringify(actualErrors)).to.contain('You may need to install and configure a special feature');
        });
    });
});

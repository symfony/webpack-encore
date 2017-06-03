'use strict';

const expect = require('chai').expect;
const formatter = require('../../../lib/friendly-errors/formatters/missing-loader');

describe('formatters/missing-loader', () => {

    describe('test format()', () => {
        it('works with no errors', () => {
            const actualErrors = formatter([]);
            expect(actualErrors).to.be.empty;
        });

        it('errors without loader-not-enabled type are filtered', () => {
            const errors = [
                { type: 'loader-not-enabled', file: 'not-enabled.sass' },
                { type: 'other-type', file: 'other-type.sass' }
            ];

            const actualErrors = formatter(errors);
            expect(JSON.stringify(actualErrors)).to.contain('not-enabled.sass');
            expect(JSON.stringify(actualErrors)).to.not.contain('other-type.sass');
        });

        it('error is formatted correctly', () => {
            const error = {
                type: 'loader-not-enabled',
                file: '/some/file.sass',
                loaderName: 'sass'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).to.contain('To load SASS files');
            expect(JSON.stringify(actualErrors)).to.contain('Encore.enableSassLoader()');
            // all needed packages will be present when running tests
            expect(JSON.stringify(actualErrors)).to.not.contain('yarn add');
        });

        it('error is formatted correctly without loaderName', () => {
            const error = {
                type: 'loader-not-enabled',
                file: '/some/file.jpg'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).to.contain('To load /some/file.jpg');
            expect(JSON.stringify(actualErrors)).to.contain('You may need to install and configure a special loader');
        });
    });
});

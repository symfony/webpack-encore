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
const formatter = require('../../../lib/friendly-errors/formatters/missing-css-file');

describe('formatters/missing-css-file', () => {

    describe('test format()', () => {
        it('works with no errors', () => {
            const actualErrors = formatter([]);
            expect(actualErrors).to.be.empty;
        });

        it(' filters errors that dont have the correct type', () => {
            const errors = [
                { type: 'missing-css-file', file: 'some-file.sass', ref: '../images/foo.png' },
                { type: 'other-type', file: 'other-type.sass' }
            ];

            const actualErrors = formatter(errors);
            expect(JSON.stringify(actualErrors)).to.contain('some-file.sass');
            expect(JSON.stringify(actualErrors)).to.not.contain('other-type.sass');
        });

        it('formats the error correctly', () => {
            const error = {
                type: 'missing-css-file',
                file: '/some/file.css',
                ref: '../images/foo.png'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).to.contain('/some/file.css contains a reference to the file ../images/foo.png');
            expect(JSON.stringify(actualErrors)).to.contain('This file can not be found, please check it for typos or update it if the file got moved.');
            // all needed packages will be present when running tests
            expect(JSON.stringify(actualErrors)).to.not.contain('yarn add');
        });
    });
});

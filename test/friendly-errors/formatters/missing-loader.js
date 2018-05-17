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
            expect(JSON.stringify(actualErrors)).to.contain('To load Sass files');
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

        it('vue loader error includes original message & origin', () => {
            const error = {
                message: 'I am a message from vue-loader',
                isVueLoader: true,
                loaderName: 'sass',
                origin: 'Some stacktrace info from origin',
                type: 'loader-not-enabled',
                file: '/path/to/project/node_modules/vue-loader/lib??vue-loader-options!./vuejs/App.vue?vue&type=style&index=1&lang=scss'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).to.contain('I am a message from vue-loader');
            expect(JSON.stringify(actualErrors)).to.contain('Some stacktrace info from origin');
            expect(JSON.stringify(actualErrors)).to.not.contain('/path/to/project/node_modules/vue-loader');
        });
    });
});

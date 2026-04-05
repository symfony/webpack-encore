/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import formatter from '../../../lib/friendly-errors/formatters/missing-loader.js';

describe('formatters/missing-loader', function() {

    describe('test format()', function() {
        it('works with no errors', function() {
            const actualErrors = formatter([]);
            expect(actualErrors).to.be.empty;
        });

        it('errors without loader-not-enabled type are filtered', function() {
            const errors = [
                { type: 'loader-not-enabled', file: 'not-enabled.sass' },
                { type: 'other-type', file: 'other-type.sass' }
            ];

            const actualErrors = formatter(errors);
            expect(JSON.stringify(actualErrors)).toContain('not-enabled.sass');
            expect(JSON.stringify(actualErrors)).not.toContain('other-type.sass');
        });

        it('error is formatted correctly', function() {
            const error = {
                type: 'loader-not-enabled',
                file: '/some/file.sass',
                loaderName: 'sass'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).toContain('To load Sass files');
            expect(JSON.stringify(actualErrors)).toContain('Encore.enableSassLoader()');
            // all needed packages will be present when running tests
            expect(JSON.stringify(actualErrors)).not.toContain('yarn add');
        });

        it('error is formatted correctly without loaderName', function() {
            const error = {
                type: 'loader-not-enabled',
                file: '/some/file.jpg'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).toContain('To load \\"/some/file.jpg\\"');
            expect(JSON.stringify(actualErrors)).toContain('You may need to install and configure a special loader');
        });

        it('vue loader error includes original message & origin', function() {
            const error = {
                message: 'I am a message from vue-loader',
                isVueLoader: true,
                loaderName: 'sass',
                origin: 'Some stacktrace info from origin',
                type: 'loader-not-enabled',
                file: '/path/to/project/node_modules/vue-loader/lib??vue-loader-options!./vuejs/App.vue?vue&type=style&index=1&lang=scss'
            };

            const actualErrors = formatter([error]);
            expect(JSON.stringify(actualErrors)).toContain('I am a message from vue-loader');
            expect(JSON.stringify(actualErrors)).toContain('Some stacktrace info from origin');
            expect(JSON.stringify(actualErrors)).not.toContain('/path/to/project/node_modules/vue-loader');
        });
    });
});

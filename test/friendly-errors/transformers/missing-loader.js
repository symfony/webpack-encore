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
const transform = require('../../../lib/friendly-errors/transformers/missing-loader');

describe('transform/missing-loader', () => {

    describe('test transform', () => {
        it('Error not with "ModuleParseError" name is ignored', () => {
            const startError = {
                name: 'OtherParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error not containing "appropriate loader" is ignored', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'Some other message',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error with unsupported file extension is ignored', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.jpg',
                isVueLoader: false
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Matching error is properly transformed', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.name).to.deep.equal('Loader not enabled');
            expect(actualError.type).to.deep.equal('loader-not-enabled');
            expect(actualError.loaderName).to.deep.equal('sass');
        });

        it('Typescript error is properly transformed', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.ts'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.name).to.deep.equal('Loader not enabled');
            expect(actualError.type).to.deep.equal('loader-not-enabled');
            expect(actualError.loaderName).to.deep.equal('typescript');
        });

        it('vue-loader is handled correctly', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'Module parse failed: Unexpected character \'#\' (35:0)\nYou may need an appropriate loader to handle this file type.\n| \n| \n| #app {\n|   display: flex;\n|   color: #2c3e90;',
                file: '/path/to/project/node_modules/vue-loader/lib??vue-loader-options!./vuejs/App.vue?vue&type=style&index=1&lang=scss'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.name).to.deep.equal('Loader not enabled');
            expect(actualError.type).to.deep.equal('loader-not-enabled');
            expect(actualError.loaderName).to.deep.equal('sass');
            expect(actualError.isVueLoader).to.be.true;
        });

        it('vue-loader is handled correctly, more options after lang=', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'Module parse failed: Unexpected character \'#\' (35:0)\nYou may need an appropriate loader to handle this file type.\n| \n| \n| #app {\n|   display: flex;\n|   color: #2c3e90;',
                file: '/path/to/project/node_modules/vue-loader/lib??vue-loader-options!./vuejs/App.vue?vue&type=style&index=1&lang=scss&foo=bar'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.name).to.deep.equal('Loader not enabled');
            expect(actualError.type).to.deep.equal('loader-not-enabled');
            expect(actualError.loaderName).to.deep.equal('sass');
        });
    });
});

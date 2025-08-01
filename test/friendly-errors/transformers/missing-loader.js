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
const transformFactory = require('../../../lib/friendly-errors/transformers/missing-loader');
const RuntimeConfig = require('../../../lib/config/RuntimeConfig');
const WebpackConfig = require('../../../lib/WebpackConfig');

const runtimeConfig = new RuntimeConfig();
runtimeConfig.context = __dirname;
runtimeConfig.babelRcFileExists = false;
const transform = transformFactory(new WebpackConfig(runtimeConfig));

describe('transform/missing-loader', function() {

    describe('test transform', function() {
        it('Error not with "ModuleParseError" name is ignored', function() {
            const startError = {
                name: 'OtherParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error not containing "appropriate loader" is ignored', function() {
            const startError = {
                name: 'ModuleParseError',
                message: 'Some other message',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error with unsupported file extension is ignored', function() {
            const startError = {
                name: 'ModuleParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.jpg',
                isVueLoader: false
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Matching error is properly transformed', function() {
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

        it('Typescript error is properly transformed', function() {
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

        it('vue-loader15 is handled correctly', function() {
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

        it('vue-loader16 is handled correctly', function() {
            const startError = {
                name: 'ModuleParseError',
                message: 'Module parse failed: Unexpected character \'#\' (35:0)\nYou may need an appropriate loader to handle this file type.\n| \n| \n| #app {\n|   display: flex;\n|   color: #2c3e90;',
                file: '/path/to/project/node_modules/vue-loader/dist??ref--4-0!./vuejs/App.vue?vue&type=style&index=1&lang=scss'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.name).to.deep.equal('Loader not enabled');
            expect(actualError.type).to.deep.equal('loader-not-enabled');
            expect(actualError.loaderName).to.deep.equal('sass');
            expect(actualError.isVueLoader).to.be.true;
        });

        it('vue-loader is handled correctly, more options after lang=', function() {
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

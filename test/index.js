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
require('../lib/context').runtimeConfig = {};
const api = require('../index');

describe('Public API', () => {

    describe('setOutputPath', () => {

        it('must return the API object', () => {
            const returnedValue = api.setOutputPath('/');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setPublicPath', () => {

        it('must return the API object', () => {
            const returnedValue = api.setPublicPath('/');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setManifestKeyPrefix', () => {

        it('must return the API object', () => {
            const returnedValue = api.setManifestKeyPrefix('/build');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addEntry', () => {

        it('must return the API object', () => {
            const returnedValue = api.addEntry('entry', 'main.js');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addStyleEntry', () => {

        it('must return the API object', () => {
            const returnedValue = api.addStyleEntry('styleEntry', 'main.css');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addPlugin', () => {

        it('must return the API object', () => {
            const returnedValue = api.addPlugin(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.addLoader(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addRule', () => {

        it('must return the API object', () => {
            const returnedValue = api.addRule(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableVersioning', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableVersioning();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSourceMaps', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableSourceMaps();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('createSharedEntry', () => {

        it('must return the API object', () => {
            const returnedValue = api.createSharedEntry('sharedEntry', 'vendor.js');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('autoProvideVariables', () => {

        it('must return the API object', () => {
            const returnedValue = api.autoProvideVariables({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('autoProvidejQuery', () => {

        it('must return the API object', () => {
            const returnedValue = api.autoProvidejQuery();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enablePostCssLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enablePostCssLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSassLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableSassLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableLessLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableLessLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setOutputPath', () => {

        it('must return the API object', () => {
            const returnedValue = api.configureBabel(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableReactPreset', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableReactPreset();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableTypeScriptLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableTypeScriptLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableVueLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableVueLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('cleanupOutputBeforeBuild', () => {

        it('must return the API object', () => {
            const returnedValue = api.cleanupOutputBeforeBuild();
            expect(returnedValue).to.equal(api);
        });

    });
});

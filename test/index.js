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
const api = require('../index');

function configureApi() {
    return api.configureRuntimeEnvironment('dev');
}

describe('Public API', () => {
    beforeEach(() => {
        api.clearRuntimeEnvironment();
    });

    describe('setOutputPath', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.setOutputPath('/')).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.setOutputPath('/');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setPublicPath', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.setPublicPath('/')).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.setPublicPath('/');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setManifestKeyPrefix', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.setManifestKeyPrefix('/build')).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.setManifestKeyPrefix('/build');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addEntry', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.addEntry('entry', 'main.js')).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.addEntry('entry', 'main.js');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addStyleEntry', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.addStyleEntry('styleEntry', 'main.css')).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.addStyleEntry('styleEntry', 'main.css');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addPlugin', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.addPlugin(null)).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.addPlugin(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addLoader', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.addLoader(null)).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.addLoader(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addRule', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.addRule(null)).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.addRule(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableVersioning', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enableVersioning()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enableVersioning();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSourceMaps', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enableSourceMaps()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enableSourceMaps();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('createSharedEntry', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.createSharedEntry('sharedEntry', 'vendor.js')).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.createSharedEntry('sharedEntry', 'vendor.js');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('autoProvideVariables', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.autoProvideVariables({})).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.autoProvideVariables({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('autoProvidejQuery', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.autoProvidejQuery()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.autoProvidejQuery();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enablePostCssLoader', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enablePostCssLoader()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enablePostCssLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSassLoader', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enableSassLoader()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enableSassLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableLessLoader', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enableLessLoader()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enableLessLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setOutputPath', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.configureBabel(() => {})).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.configureBabel(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableReactPreset', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enableReactPreset()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enableReactPreset();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableTypeScriptLoader', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enableTypeScriptLoader()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enableTypeScriptLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableVueLoader', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.enableVueLoader()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.enableVueLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('cleanupOutputBeforeBuild', () => {

        it('should not be callable before the runtime environment has been configured', () => {
            expect(() => api.cleanupOutputBeforeBuild()).to.throw();
        });

        it('must return the API object', () => {
            configureApi();
            const returnedValue = api.cleanupOutputBeforeBuild();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureRuntimeEnvironment', () => {

        it('should return the API object', () => {
            const returnedValue = api.configureRuntimeEnvironment('dev');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('clearRuntimeEnvironment', () => {

        it('should be callable even if the runtime environment has not been configured', () => {
            expect(() => api.clearRuntimeEnvironment()).to.not.throw();
        });

    });
});

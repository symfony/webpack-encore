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
const api = require('../index');

describe('Public API', () => {
    beforeEach(() => {
        api.configureRuntimeEnvironment('dev');
    });

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

    describe('addAliases', () => {

        it('must return the API object', () => {
            const returnedValue = api.addAliases({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addExternals', () => {

        it('must return the API object', () => {
            const returnedValue = api.addExternals({});
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

    describe('copyFiles', () => {

        it('must return the API object', () => {
            const returnedValue = api.copyFiles({ from: './foo' });
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSingleRuntimeChunk', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableSingleRuntimeChunk();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('disableSingleRuntimeChunk', () => {

        it('must return the API object', () => {
            const returnedValue = api.disableSingleRuntimeChunk();
            expect(returnedValue).to.equal(api);
        });

    });


    describe('splitEntryChunks', () => {

        it('must return the API object', () => {
            const returnedValue = api.splitEntryChunks();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureSplitChunks', () => {

        it('must return the API object', () => {
            const returnedValue = api.configureSplitChunks(() => {});
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

    describe('enableStylusLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableStylusLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureBabel', () => {

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

    describe('enablePreactPreset', () => {

        it('must return the API object', () => {
            const returnedValue = api.enablePreactPreset();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableTypeScriptLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableTypeScriptLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableForkedTypeScriptTypesChecking', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableForkedTypeScriptTypesChecking();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableVueLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableVueLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableBuildNotifications', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableBuildNotifications();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableHandlebarsLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.enableHandlebarsLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('disableImagesLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.disableImagesLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('disableFontsLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.disableFontsLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureFilenames', () => {

        it('must return the API object', () => {
            const returnedValue = api.configureFilenames({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureUrlLoader', () => {

        it('must return the API object', () => {
            const returnedValue = api.configureUrlLoader({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('cleanupOutputBeforeBuild', () => {

        it('must return the API object', () => {
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

    describe('configureDefinePlugin', () => {

        it('should return the API object', () => {
            const returnedValue = api.configureDefinePlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureFriendlyErrorsPlugin', () => {

        it('should return the API object', () => {
            const returnedValue = api.configureFriendlyErrorsPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureLoaderOptionsPlugin', () => {

        it('should return the API object', () => {
            const returnedValue = api.configureLoaderOptionsPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureManifestPlugin', () => {

        it('should return the API object', () => {
            const returnedValue = api.configureManifestPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureTerserPlugin', () => {

        it('should return the API object', () => {
            const returnedValue = api.configureTerserPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('Runtime environment proxy', () => {
        beforeEach(() => {
            api.clearRuntimeEnvironment();
        });

        it('safe methods should be callable even if the runtime environment has not been configured', () => {
            expect(() => api.clearRuntimeEnvironment()).to.not.throw();
        });

        it('unsafe methods should NOT be callable if the runtime environment has not been configured', () => {
            expect(() => api.setOutputPath('/')).to.throw('Encore.setOutputPath() cannot be called yet');
        });
    });
});

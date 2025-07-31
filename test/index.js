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
const sinon = require('sinon');
const api = require('../index');
const path = require('path');

describe('Public API', function() {
    beforeEach(function() {
        process.chdir(path.join(__dirname, '..'));
        api.configureRuntimeEnvironment('dev', {}, false);
    });

    describe('setOutputPath', function() {

        it('must return the API object', function() {
            const returnedValue = api.setOutputPath('/');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setPublicPath', function() {

        it('must return the API object', function() {
            const returnedValue = api.setPublicPath('/');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('setManifestKeyPrefix', function() {

        it('must return the API object', function() {
            const returnedValue = api.setManifestKeyPrefix('/build');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addEntry', function() {

        it('must return the API object', function() {
            const returnedValue = api.addEntry('entry', 'main.js');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addStyleEntry', function() {

        it('must return the API object', function() {
            const returnedValue = api.addStyleEntry('styleEntry', 'main.css');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addPlugin', function() {

        it('must return the API object', function() {
            const returnedValue = api.addPlugin(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.addLoader(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addRule', function() {

        it('must return the API object', function() {
            const returnedValue = api.addRule(null);
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addAliases', function() {

        it('must return the API object', function() {
            const returnedValue = api.addAliases({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addExternals', function() {

        it('must return the API object', function() {
            const returnedValue = api.addExternals({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableVersioning', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableVersioning();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSourceMaps', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSourceMaps();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('addCacheGroup', function() {

        it('must return the API object', function() {
            const returnedValue = api.addCacheGroup('sharedEntry', {
                test: /vendor\.js/
            });
            expect(returnedValue).to.equal(api);
        });

    });

    describe('copyFiles', function() {

        it('must return the API object', function() {
            const returnedValue = api.copyFiles({ from: './foo' });
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSingleRuntimeChunk', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSingleRuntimeChunk();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('disableSingleRuntimeChunk', function() {

        it('must return the API object', function() {
            const returnedValue = api.disableSingleRuntimeChunk();
            expect(returnedValue).to.equal(api);
        });

    });


    describe('splitEntryChunks', function() {

        it('must return the API object', function() {
            const returnedValue = api.splitEntryChunks();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureSplitChunks', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureSplitChunks(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('autoProvideVariables', function() {

        it('must return the API object', function() {
            const returnedValue = api.autoProvideVariables({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('autoProvidejQuery', function() {

        it('must return the API object', function() {
            const returnedValue = api.autoProvidejQuery();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enablePostCssLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enablePostCssLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSassLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSassLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableLessLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableLessLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableStylusLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableStylusLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureBabel', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureBabel(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureBabelPresetEnv', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureBabelPresetEnv(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableReactPreset', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableReactPreset();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableSvelte', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSvelte();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enablePreactPreset', function() {

        it('must return the API object', function() {
            const returnedValue = api.enablePreactPreset();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableTypeScriptLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableTypeScriptLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableForkedTypeScriptTypesChecking', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableForkedTypeScriptTypesChecking();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableVueLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableVueLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableBuildNotifications', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableBuildNotifications();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableHandlebarsLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableHandlebarsLoader();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('disableCssExtraction', function() {

        it('must return the API object', function() {
            const returnedValue = api.disableCssExtraction();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureFilenames', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureFilenames({});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureImageRule', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureImageRule();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureFontRule', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureFontRule();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('cleanupOutputBeforeBuild', function() {

        it('must return the API object', function() {
            const returnedValue = api.cleanupOutputBeforeBuild();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureRuntimeEnvironment', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureRuntimeEnvironment('dev');
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureDefinePlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureDefinePlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureFriendlyErrorsPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureFriendlyErrorsPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureManifestPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureManifestPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureTerserPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureTerserPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('configureCssMinimizerPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureCssMinimizerPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableStimulusBridge', function() {

        it('should return the API object', function() {
            const returnedValue = api.enableStimulusBridge(path.resolve(__dirname, '../', 'package.json'));
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableBuildCache', function() {

        it('should return the API object', function() {
            const returnedValue = api.enableBuildCache({ config: [__filename] });
            expect(returnedValue).to.equal(api);
        });

    });


    describe('configureMiniCssExtractPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureMiniCssExtractPlugin(() => {});
            expect(returnedValue).to.equal(api);
        });

    });

    describe('enableIntegrityHashes', function() {

        it('should return the API object', function() {
            const returnedValue = api.enableIntegrityHashes();
            expect(returnedValue).to.equal(api);
        });

    });

    describe('when', function() {
        it('should call or not callbacks depending of the conditions', function() {
            api.configureRuntimeEnvironment('dev', {}, false);

            const spy = sinon.spy();
            api
                .when((Encore) => Encore.isDev(), (Encore) => spy('is dev'))
                .when((Encore) => Encore.isProduction(), (Encore) => spy('is production'))
                .when(true, (Encore) => spy('true'));
            expect(spy.calledWith('is dev'), 'callback for "is dev" should be called').to.be.true;
            expect(spy.calledWith('is production'), 'callback for "is production" should NOT be called').to.be.false;
            expect(spy.calledWith('true'), 'callback for "true" should be called').to.be.true;
        });
    });

    describe('isRuntimeEnvironmentConfigured', function() {

        it('should return true if the runtime environment has been configured', function() {
            const returnedValue = api.isRuntimeEnvironmentConfigured();
            expect(returnedValue).to.be.true;
        });

        it('should return false if the runtime environment has not been configured', function() {
            api.clearRuntimeEnvironment();

            const returnedValue = api.isRuntimeEnvironmentConfigured();
            expect(returnedValue).to.be.false;
        });

    });

    describe('Runtime environment proxy', function() {
        beforeEach(function() {
            api.clearRuntimeEnvironment();
        });

        it('safe methods should be callable even if the runtime environment has not been configured', function() {
            expect(() => api.clearRuntimeEnvironment()).to.not.throw();
        });

        it('unsafe methods should NOT be callable if the runtime environment has not been configured', function() {
            expect(() => api.setOutputPath('/')).to.throw('Encore.setOutputPath() cannot be called yet');
        });
    });
});

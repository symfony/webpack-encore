/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

import api from '../index.js';
import path from 'path';

describe('Public API', function() {
    beforeEach(function() {
        process.chdir(path.join(import.meta.dirname, '..'));
        api.configureRuntimeEnvironment('dev', {}, false);
    });

    describe('setOutputPath', function() {

        it('must return the API object', function() {
            const returnedValue = api.setOutputPath('/');
            expect(returnedValue).toBe(api);
        });

    });

    describe('setPublicPath', function() {

        it('must return the API object', function() {
            const returnedValue = api.setPublicPath('/');
            expect(returnedValue).toBe(api);
        });

    });

    describe('setManifestKeyPrefix', function() {

        it('must return the API object', function() {
            const returnedValue = api.setManifestKeyPrefix('/build');
            expect(returnedValue).toBe(api);
        });

    });

    describe('addEntry', function() {

        it('must return the API object', function() {
            const returnedValue = api.addEntry('entry', 'main.js');
            expect(returnedValue).toBe(api);
        });

    });

    describe('addStyleEntry', function() {

        it('must return the API object', function() {
            const returnedValue = api.addStyleEntry('styleEntry', 'main.css');
            expect(returnedValue).toBe(api);
        });

    });

    describe('addPlugin', function() {

        it('must return the API object', function() {
            const returnedValue = api.addPlugin(null);
            expect(returnedValue).toBe(api);
        });

    });

    describe('addLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.addLoader(null);
            expect(returnedValue).toBe(api);
        });

    });

    describe('addRule', function() {

        it('must return the API object', function() {
            const returnedValue = api.addRule(null);
            expect(returnedValue).toBe(api);
        });

    });

    describe('addAliases', function() {

        it('must return the API object', function() {
            const returnedValue = api.addAliases({});
            expect(returnedValue).toBe(api);
        });

    });

    describe('addExternals', function() {

        it('must return the API object', function() {
            const returnedValue = api.addExternals({});
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableVersioning', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableVersioning();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableSourceMaps', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSourceMaps();
            expect(returnedValue).toBe(api);
        });

    });

    describe('addCacheGroup', function() {

        it('must return the API object', function() {
            const returnedValue = api.addCacheGroup('sharedEntry', {
                test: /vendor\.js/
            });
            expect(returnedValue).toBe(api);
        });

    });

    describe('copyFiles', function() {

        it('must return the API object', function() {
            const returnedValue = api.copyFiles({ from: './foo' });
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableSingleRuntimeChunk', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSingleRuntimeChunk();
            expect(returnedValue).toBe(api);
        });

    });

    describe('disableSingleRuntimeChunk', function() {

        it('must return the API object', function() {
            const returnedValue = api.disableSingleRuntimeChunk();
            expect(returnedValue).toBe(api);
        });

    });
    describe('splitEntryChunks', function() {

        it('must return the API object', function() {
            const returnedValue = api.splitEntryChunks();
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureSplitChunks', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureSplitChunks(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('autoProvideVariables', function() {

        it('must return the API object', function() {
            const returnedValue = api.autoProvideVariables({});
            expect(returnedValue).toBe(api);
        });

    });

    describe('autoProvidejQuery', function() {

        it('must return the API object', function() {
            const returnedValue = api.autoProvidejQuery();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enablePostCssLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enablePostCssLoader();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableSassLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSassLoader();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableLessLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableLessLoader();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableStylusLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableStylusLoader();
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureBabel', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureBabel(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureBabelPresetEnv', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureBabelPresetEnv(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableReactPreset', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableReactPreset();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableSvelte', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableSvelte();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enablePreactPreset', function() {

        it('must return the API object', function() {
            const returnedValue = api.enablePreactPreset();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableTypeScriptLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableTypeScriptLoader();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableForkedTypeScriptTypesChecking', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableForkedTypeScriptTypesChecking();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableVueLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableVueLoader();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableBuildNotifications', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableBuildNotifications();
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableHandlebarsLoader', function() {

        it('must return the API object', function() {
            const returnedValue = api.enableHandlebarsLoader();
            expect(returnedValue).toBe(api);
        });

    });

    describe('disableCssExtraction', function() {

        it('must return the API object', function() {
            const returnedValue = api.disableCssExtraction();
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureFilenames', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureFilenames({});
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureImageRule', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureImageRule();
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureFontRule', function() {

        it('must return the API object', function() {
            const returnedValue = api.configureFontRule();
            expect(returnedValue).toBe(api);
        });

    });

    describe('cleanupOutputBeforeBuild', function() {

        it('must return the API object', function() {
            const returnedValue = api.cleanupOutputBeforeBuild();
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureRuntimeEnvironment', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureRuntimeEnvironment('dev');
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureDefinePlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureDefinePlugin(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureFriendlyErrorsPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureFriendlyErrorsPlugin(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureManifestPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureManifestPlugin(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureTerserPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureTerserPlugin(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('configureCssMinimizerPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureCssMinimizerPlugin(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableStimulusBridge', function() {

        it('should return the API object', function() {
            const returnedValue = api.enableStimulusBridge(path.resolve(import.meta.dirname, '../', 'package.json'));
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableBuildCache', function() {

        it('should return the API object', function() {
            const returnedValue = api.enableBuildCache({ config: [import.meta.filename] });
            expect(returnedValue).toBe(api);
        });

    });
    describe('configureMiniCssExtractPlugin', function() {

        it('should return the API object', function() {
            const returnedValue = api.configureMiniCssExtractPlugin(() => {});
            expect(returnedValue).toBe(api);
        });

    });

    describe('enableIntegrityHashes', function() {

        it('should return the API object', function() {
            const returnedValue = api.enableIntegrityHashes();
            expect(returnedValue).toBe(api);
        });

    });

    describe('when', function() {
        it('should call or not callbacks depending of the conditions', function() {
            api.configureRuntimeEnvironment('dev', {}, false);

            const spy = vi.fn();
            api
                .when((Encore) => Encore.isDev(), (Encore) => spy('is dev'))
                .when((Encore) => Encore.isProduction(), (Encore) => spy('is production'))
                .when(true, (Encore) => spy('true'));
            expect(spy.mock.calls.some(call => call[0] === 'is dev'), 'callback for "is dev" should be called').toBe(true);
            expect(spy.mock.calls.some(call => call[0] === 'is production'), 'callback for "is production" should NOT be called').toBe(false);
            expect(spy.mock.calls.some(call => call[0] === 'true'), 'callback for "true" should be called').toBe(true);
        });
    });

    describe('isRuntimeEnvironmentConfigured', function() {

        it('should return true if the runtime environment has been configured', function() {
            const returnedValue = api.isRuntimeEnvironmentConfigured();
            expect(returnedValue).toBe(true);
        });

        it('should return false if the runtime environment has not been configured', function() {
            api.clearRuntimeEnvironment();

            const returnedValue = api.isRuntimeEnvironmentConfigured();
            expect(returnedValue).toBe(false);
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
            expect(() => api.setOutputPath('/')).toThrow('Encore.setOutputPath() cannot be called yet');
        });
    });
});

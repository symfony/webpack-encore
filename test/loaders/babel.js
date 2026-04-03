/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect, beforeAll, afterAll, vi } from 'vitest';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import babelLoader from '../../lib/loaders/babel.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/babel', function() {
    it('getLoaders() basic usage', async function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = false;
        config.configureBabel(function(config) {
            config.foo = 'bar';
        });

        const actualLoaders = await babelLoader.getLoaders(config);
        expect(actualLoaders).toHaveLength(1);
        // the env preset is enabled by default
        expect(actualLoaders[0].options.presets).toHaveLength(1);
        // callback is used
        expect(actualLoaders[0].options.foo).toBe('bar');
    });

    it('getLoaders() when .babelrc IS present', async function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = true;

        const actualLoaders = await babelLoader.getLoaders(config);
        // we only add cacheDirectory
        expect(actualLoaders[0].options).toEqual({
            cacheDirectory: true,
            sourceType: 'unambiguous',
        });
    });

    it('getLoaders() for production', async function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = true;
        config.runtimeConfig.environment = 'production';

        const actualLoaders = await babelLoader.getLoaders(config);
        // cacheDirectory is disabled in production mode
        expect(actualLoaders[0].options).toEqual({
            cacheDirectory: false,
            sourceType: 'unambiguous',
        });
    });

    it('getLoaders() with react', async function() {
        const config = createConfig();
        config.enableReactPreset();

        config.configureBabel(function(babelConfig) {
            babelConfig.presets.push('foo');
        });

        const actualLoaders = await babelLoader.getLoaders(config);

        // env, react & foo
        expect(actualLoaders[0].options.presets).toHaveLength(3);
        expect(actualLoaders[0].options.presets[0]).toEqual([
            fileURLToPath(import.meta.resolve('@babel/preset-env')),
            {
                corejs: null,
                modules: false,
                targets: {},
                useBuiltIns: false,
            },
        ]);
        expect(actualLoaders[0].options.presets[1]).toEqual([
            fileURLToPath(import.meta.resolve('@babel/preset-react')),
            {
                runtime: 'automatic',
            }
        ]);
        // foo is also still there, not overridden
        expect(actualLoaders[0].options.presets[2]).toBe('foo');
    });

    it('getLoaders() with react and callback', async function() {
        const config = createConfig();
        config.enableReactPreset((options) => {
            options.development = !config.isProduction();
        });

        config.configureBabel(function(babelConfig) {
            babelConfig.presets.push('foo');
        });

        const actualLoaders = await babelLoader.getLoaders(config);

        // env, react & foo
        expect(actualLoaders[0].options.presets).toHaveLength(3);
        expect(actualLoaders[0].options.presets[0]).toEqual([
            fileURLToPath(import.meta.resolve('@babel/preset-env')),
            {
                corejs: null,
                modules: false,
                targets: {},
                useBuiltIns: false,
            },
        ]);
        expect(actualLoaders[0].options.presets[1]).toEqual([
            fileURLToPath(import.meta.resolve('@babel/preset-react')),
            {
                runtime: 'automatic',
                development: true,
            }
        ]);
        // foo is also still there, not overridden
        expect(actualLoaders[0].options.presets[2]).toBe('foo');
    });

    it('getLoaders() with preact', async function() {
        const config = createConfig();
        config.enablePreactPreset();

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = await babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            [fileURLToPath(import.meta.resolve('@babel/plugin-transform-react-jsx')), { pragma: 'h' }],
            'foo'
        ]);
    });

    it('getLoaders() with preact and preact-compat', async function() {
        const config = createConfig();
        config.enablePreactPreset({ preactCompat: true });

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = await babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            [fileURLToPath(import.meta.resolve('@babel/plugin-transform-react-jsx'))],
            'foo'
        ]);
    });

    it('getLoaders() with a callback that returns an object', async function() {
        const config = createConfig();
        config.enablePreactPreset({ preactCompat: true });

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = await babelLoader.getLoaders(config);
        expect(actualLoaders[0].options).toEqual({ 'foo': true });
    });

    it('getLoaders() with Vue and JSX support', async function() {
        const config = createConfig();
        config.enableVueLoader(() => {}, {
            version: 3,
            useJsx: true,
        });

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = await babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            fileURLToPath(import.meta.resolve('@vue/babel-plugin-jsx')),
            'foo'
        ]);
    });

    it('getLoaders() with configured babel env preset', async function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = false;

        config.configureBabel(function(config) {
            config.corejs = null;
        });

        config.configureBabelPresetEnv(function(config) {
            config.corejs = 3;
            config.include = ['bar'];
        });

        const actualLoaders = await babelLoader.getLoaders(config);

        // options are overridden
        expect(actualLoaders[0].options.presets[0][1].corejs).toBe(3);
        expect(actualLoaders[0].options.presets[0][1].include).to.have.members(['bar']);
    });

    it('getLoaders() with TypeScript', async function() {
        const config = createConfig();
        const presetTypeScriptOptions = { isTSX: true };

        config.enableBabelTypeScriptPreset(presetTypeScriptOptions);

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = await babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.presets[0][0]).toBe(fileURLToPath(import.meta.resolve('@babel/preset-env')));
        expect(actualLoaders[0].options.presets[1][0]).toBe(fileURLToPath(import.meta.resolve('@babel/preset-typescript')));
        expect(actualLoaders[0].options.presets[1][1]).toBe(presetTypeScriptOptions);
        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            'foo'
        ]);
    });

    it('getTest() base behavior', function() {
        const config = createConfig();

        const actualTest = babelLoader.getTest(config);
        expect(actualTest.toString()).to.equals(/\.(m?jsx?)$/.toString());
    });

    it('getTest() with TypeScript', function() {
        const config = createConfig();
        config.enableBabelTypeScriptPreset();

        const actualTest = babelLoader.getTest(config);
        expect(actualTest.toString()).to.equals(/\.(m?jsx?|tsx?)$/.toString());
    });
});

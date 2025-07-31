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
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const babelLoader = require('../../lib/loaders/babel');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/babel', function() {
    it('getLoaders() basic usage', function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = false;
        config.configureBabel(function(config) {
            config.foo = 'bar';
        });

        const actualLoaders = babelLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        // the env preset is enabled by default
        expect(actualLoaders[0].options.presets).to.have.lengthOf(1);
        // callback is used
        expect(actualLoaders[0].options.foo).to.equal('bar');
    });

    it('getLoaders() when .babelrc IS present', function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = true;

        const actualLoaders = babelLoader.getLoaders(config);
        // we only add cacheDirectory
        expect(actualLoaders[0].options).to.deep.equal({
            cacheDirectory: true,
            sourceType: 'unambiguous',
        });
    });

    it('getLoaders() for production', function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = true;
        config.runtimeConfig.environment = 'production';

        const actualLoaders = babelLoader.getLoaders(config);
        // cacheDirectory is disabled in production mode
        expect(actualLoaders[0].options).to.deep.equal({
            cacheDirectory: false,
            sourceType: 'unambiguous',
        });
    });

    it('getLoaders() with react', function() {
        const config = createConfig();
        config.enableReactPreset();

        config.configureBabel(function(babelConfig) {
            babelConfig.presets.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // env, react & foo
        expect(actualLoaders[0].options.presets).to.have.lengthOf(3);
        expect(actualLoaders[0].options.presets[0]).to.deep.equal([
            require.resolve('@babel/preset-env'),
            {
                corejs: null,
                modules: false,
                targets: {},
                useBuiltIns: false,
            },
        ]);
        expect(actualLoaders[0].options.presets[1]).to.deep.equal([
            require.resolve('@babel/preset-react'),
            {
                runtime: 'automatic',
            }
        ]);
        // foo is also still there, not overridden
        expect(actualLoaders[0].options.presets[2]).to.equal('foo');
    });

    it('getLoaders() with react and callback', function() {
        const config = createConfig();
        config.enableReactPreset((options) => {
            options.development = !config.isProduction();
        });

        config.configureBabel(function(babelConfig) {
            babelConfig.presets.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // env, react & foo
        expect(actualLoaders[0].options.presets).to.have.lengthOf(3);
        expect(actualLoaders[0].options.presets[0]).to.deep.equal([
            require.resolve('@babel/preset-env'),
            {
                corejs: null,
                modules: false,
                targets: {},
                useBuiltIns: false,
            },
        ]);
        expect(actualLoaders[0].options.presets[1]).to.deep.equal([
            require.resolve('@babel/preset-react'),
            {
                runtime: 'automatic',
                development: true,
            }
        ]);
        // foo is also still there, not overridden
        expect(actualLoaders[0].options.presets[2]).to.equal('foo');
    });

    it('getLoaders() with preact', function() {
        const config = createConfig();
        config.enablePreactPreset();

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            [require.resolve('@babel/plugin-transform-react-jsx'), { pragma: 'h' }],
            'foo'
        ]);
    });

    it('getLoaders() with preact and preact-compat', function() {
        const config = createConfig();
        config.enablePreactPreset({ preactCompat: true });

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            [require.resolve('@babel/plugin-transform-react-jsx')],
            'foo'
        ]);
    });

    it('getLoaders() with a callback that returns an object', function() {
        const config = createConfig();
        config.enablePreactPreset({ preactCompat: true });

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = babelLoader.getLoaders(config);
        expect(actualLoaders[0].options).to.deep.equal({ 'foo': true });
    });

    it('getLoaders() with Vue and JSX support', function() {
        const config = createConfig();
        config.enableVueLoader(() => {}, {
            useJsx: true,
        });

        config.configureBabel(function(babelConfig) {
            babelConfig.presets.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.presets).to.deep.include.members([
            require.resolve('@vue/babel-preset-jsx'),
            'foo'
        ]);
    });

    it('getLoaders() with configured babel env preset', function() {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = false;

        config.configureBabel(function(config) {
            config.corejs = null;
        });

        config.configureBabelPresetEnv(function(config) {
            config.corejs = 3;
            config.include = ['bar'];
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // options are overridden
        expect(actualLoaders[0].options.presets[0][1].corejs).to.equal(3);
        expect(actualLoaders[0].options.presets[0][1].include).to.have.members(['bar']);
    });

    it('getLoaders() with TypeScript', function() {
        const config = createConfig();
        const presetTypeScriptOptions = { isTSX: true };

        config.enableBabelTypeScriptPreset(presetTypeScriptOptions);

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.presets[0][0]).to.equal(require.resolve('@babel/preset-env'));
        expect(actualLoaders[0].options.presets[1][0]).to.equal(require.resolve('@babel/preset-typescript'));
        expect(actualLoaders[0].options.presets[1][1]).to.equal(presetTypeScriptOptions);
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

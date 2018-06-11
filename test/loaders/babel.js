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

describe('loaders/babel', () => {
    it('getLoaders() basic usage', () => {
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

    it('getLoaders() when .babelrc IS present', () => {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = true;

        const actualLoaders = babelLoader.getLoaders(config);
        // we only add cacheDirectory
        expect(actualLoaders[0].options).to.deep.equal({
            cacheDirectory: true
        });
    });

    it('getLoaders() with react', () => {
        const config = createConfig();
        config.enableReactPreset();

        config.configureBabel(function(babelConfig) {
            babelConfig.presets.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // env, react & foo
        expect(actualLoaders[0].options.presets).to.have.lengthOf(3);
        expect(actualLoaders[0].options.presets).to.include('@babel/react');
        // foo is also still there, not overridden
        expect(actualLoaders[0].options.presets).to.include('foo');
    });

    it('getLoaders() with preact', () => {
        const config = createConfig();
        config.enablePreactPreset();

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            '@babel/plugin-syntax-dynamic-import',
            ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
            'foo'
        ]);
    });

    it('getLoaders() with preact and preact-compat', () => {
        const config = createConfig();
        config.enablePreactPreset({ preactCompat: true });

        config.configureBabel(function(babelConfig) {
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            '@babel/plugin-syntax-dynamic-import',
            ['@babel/plugin-transform-react-jsx'],
            'foo'
        ]);
    });

    it('getLoaders() with a callback that returns an object', () => {
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
});

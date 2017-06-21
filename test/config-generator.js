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
const WebpackConfig = require('../lib/WebpackConfig');
const RuntimeConfig = require('../lib/config/RuntimeConfig');
const configGenerator = require('../lib/config-generator');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('./../lib/webpack/webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

function createConfig(runtimeConfig = null) {
    runtimeConfig = runtimeConfig ? runtimeConfig : new RuntimeConfig();

    if (null === runtimeConfig.context) {
        runtimeConfig.context = __dirname;
    }

    if (null === runtimeConfig.environment) {
        runtimeConfig.environment = 'dev';
    }

    if (null === runtimeConfig.babelRcFileExists) {
        runtimeConfig.babelRcFileExists = false;
    }

    return new WebpackConfig(runtimeConfig);
}

function findPlugin(pluginConstructor, plugins) {
    for (let plugin of plugins) {
        if (plugin instanceof pluginConstructor) {
            return plugin;
        }
    }
}

/**
 * @param {RegExp} regex
 * @param {Array} rules
 * @returns {*}
 */
function findRule(regex, rules) {
    for (let rule of rules) {
        if (rule.test.toString() === regex.toString()) {
            return rule;
        }
    }

    throw new Error(`No rule found for regex ${regex}`);
}

describe('The config-generator function', () => {

    describe('Test basic output properties', () => {
        it('Returns an object with the correct properties', () => {
            // setting context explicitly to make test more dependable
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.context = '/foo/dir';
            const config = createConfig(runtimeConfig);
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';

            const actualConfig = configGenerator(config);

            expect(actualConfig.context).to.equal('/foo/dir');
            expect(actualConfig.entry).to.be.an('object');
            expect(actualConfig.output).to.be.an('object');
            expect(actualConfig.module).to.be.an('object');
            expect(actualConfig.plugins).to.be.an('Array');
        });

        it('entries and styleEntries are merged', () => {
            const config = createConfig();
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.addEntry('main', './main');
            config.addStyleEntry('style', ['./bootstrap.css', './main.css']);
            config.addEntry('main2', './main2');

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.entry)).to.equal(JSON.stringify({
                main: './main',
                main2: './main2',
                style: ['./bootstrap.css', './main.css']
            }));
        });

        it('basic output', () => {
            const config = createConfig();

            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path/';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            expect(actualConfig.output.path).to.equal('/tmp/public-path');
            expect(actualConfig.output.filename).to.equal('[name].js');
            expect(actualConfig.output.publicPath).to.equal('/public-path/');
        });
    });

    describe('Test source maps changes', () => {
        it('without sourcemaps', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useSourceMaps = false;

            const actualConfig = configGenerator(config);
            expect(actualConfig.devtool).to.be.undefined;

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('?sourceMap');
        });

        it('with sourcemaps', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useSourceMaps = true;

            const actualConfig = configGenerator(config);
            expect(actualConfig.devtool).to.equal('inline-source-map');

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('?sourceMap');
        });
    });

    describe('Test publicPath and manifestKeyPrefix variants', () => {
        it('with normal publicPath, manifestKeyPrefix matches it', () => {
            const config = createConfig();
            config.outputPath = '/tmp/web/build';
            config.addEntry('main', './main');
            config.setPublicPath('/build');

            const actualConfig = configGenerator(config);

            expect(actualConfig.output.publicPath).to.equal('/build/');
            const manifestPlugin = findPlugin(ManifestPlugin, actualConfig.plugins);
            expect(manifestPlugin.opts.publicPath).to.equal('/build/');
            // basePath matches publicPath, *without* the opening slash
            // we do that by convention: keys do not start with /
            expect(manifestPlugin.opts.basePath).to.equal('build/');
        });

        it('when manifestKeyPrefix is set, that is used instead', () => {
            const config = createConfig();
            config.outputPath = '/tmp/web/build';
            config.addEntry('main', './main');
            // pretend we're installed to a subdirectory
            config.setPublicPath('/subdirectory/build');
            config.setManifestKeyPrefix('/build');

            const actualConfig = configGenerator(config);

            expect(actualConfig.output.publicPath).to.equal('/subdirectory/build/');
            const manifestPlugin = findPlugin(ManifestPlugin, actualConfig.plugins);
            expect(manifestPlugin.opts.publicPath).to.equal('/subdirectory/build/');
            // base path matches manifestKeyPrefix + trailing slash
            // the opening slash is kept, since the user is overriding this setting
            expect(manifestPlugin.opts.basePath).to.equal('/build/');
        });

        it('manifestKeyPrefix can be empty', () => {
            const config = createConfig();
            config.outputPath = '/tmp/web/build';
            config.addEntry('main', './main');
            config.setPublicPath('/build');
            config.setManifestKeyPrefix('');

            const actualConfig = configGenerator(config);

            const manifestPlugin = findPlugin(ManifestPlugin, actualConfig.plugins);
            expect(manifestPlugin.opts.publicPath).to.equal('/build/');
            expect(manifestPlugin.opts.basePath).to.equal('');
        });
    });

    describe('Test versioning changes', () => {
        it('with versioning', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useVersioning = true;

            const actualConfig = configGenerator(config);
            expect(actualConfig.output.filename).to.equal('[name].[chunkhash].js');

            const extractTextPlugin = findPlugin(ExtractTextPlugin, actualConfig.plugins);

            expect(extractTextPlugin.filename).to.equal('[name].[contenthash].css');
        });
    });

    describe('Test production changes', () => {
        it('not in production', () => {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.context = '/tmp/context';
            runtimeConfig.environment = 'dev';
            const config = createConfig(runtimeConfig);
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableVersioning(true);

            const actualConfig = configGenerator(config);

            const loaderOptionsPlugin = findPlugin(webpack.LoaderOptionsPlugin, actualConfig.plugins);
            expect(loaderOptionsPlugin.options.debug).to.equal(true);
            expect(loaderOptionsPlugin.options.options.context).to.equal('/tmp/context');
            expect(loaderOptionsPlugin.options.options.output.path).to.equal('/tmp/output/public-path');

            const moduleNamePlugin = findPlugin(webpack.NamedModulesPlugin, actualConfig.plugins);
            expect(moduleNamePlugin).to.not.be.undefined;
        });

        it('YES to production', () => {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.environment = 'production';
            const config = createConfig(runtimeConfig);
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const loaderOptionsPlugin = findPlugin(webpack.LoaderOptionsPlugin, actualConfig.plugins);
            expect(loaderOptionsPlugin.options.debug).to.equal(false);

            const moduleHashedIdsPlugin = findPlugin(webpack.HashedModuleIdsPlugin, actualConfig.plugins);
            expect(moduleHashedIdsPlugin).to.not.be.undefined;

            const definePlugin = findPlugin(webpack.DefinePlugin, actualConfig.plugins);
            expect(definePlugin.definitions['process.env'].NODE_ENV).to.equal('"production"');

            const uglifyPlugin = findPlugin(webpack.optimize.UglifyJsPlugin, actualConfig.plugins);
            expect(uglifyPlugin).to.not.be.undefined;
        });
    });

    describe('enableSassLoader() adds the sass-loader', () => {
        it('without enableSassLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            // config.enableSassLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('sass-loader');
        });

        it('enableSassLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableSassLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('sass-loader');
        });
    });

    describe('enableLessLoader() adds the less-loader', () => {
        it('without enableLessLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            // do not enable the less loader

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('less-loader');
        });

        it('enableLessLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableLessLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('less-loader');
        });
    });

    describe('addLoader() adds a custom loader', () => {
        it('addLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addLoader({ 'test': /\.custom$/, 'loader': 'custom-loader' });

            const actualConfig = configGenerator(config);

            expect(actualConfig.module.rules).to.deep.include({ 'test': /\.custom$/, 'loader': 'custom-loader' });
        });
    });

    describe('.js rule receives different configuration', () => {
        it('Use default config', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.jsx?$/, actualConfig.module.rules);

            // check for the default env preset only
            expect(JSON.stringify(jsRule.use[0].options.presets)).contains('env');
        });
    });

    describe('cleanupOutputBeforeBuild() adds CleanWebpackPlugin', () => {
        it('without cleanupOutputBeforeBuild()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const cleanPlugin = findPlugin(CleanWebpackPlugin, actualConfig.plugins);
            expect(cleanPlugin).to.be.undefined;
        });

        it('with cleanupOutputBeforeBuild()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.cleanupOutputBeforeBuild();

            const actualConfig = configGenerator(config);

            const cleanPlugin = findPlugin(CleanWebpackPlugin, actualConfig.plugins);
            expect(cleanPlugin).to.not.be.undefined;
        });
    });

    describe('test for devServer config', () => {
        it('no devServer config when not enabled', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = false;
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);
            expect(actualConfig.devServer).to.be.undefined;
        });

        it('devServer no hot mode', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerUrl = 'http://localhost:8080/';
            config.runtimeConfig.useHotModuleReplacement = false;
            config.outputPath = '/tmp/public';
            config.setPublicPath('/');
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);
            expect(actualConfig.devServer).to.not.be.undefined;
            expect(actualConfig.devServer.hot).to.be.false;
        });

        it('hot mode', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerUrl = 'http://localhost:8080/';
            config.runtimeConfig.useHotModuleReplacement = true;
            config.outputPath = '/tmp/public';
            config.setPublicPath('/');
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);
            expect(actualConfig.devServer.hot).to.be.true;
        });
    });

    describe('test for addPlugin config', () => {
        it('extra plugin is set correctly', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.addPlugin(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));

            const actualConfig = configGenerator(config);

            const ignorePlugin = findPlugin(webpack.IgnorePlugin, actualConfig.plugins);
            expect(ignorePlugin).to.not.be.undefined;
        });
    });
});

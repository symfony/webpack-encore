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
const WebpackConfig = require('../lib/WebpackConfig');
const RuntimeConfig = require('../lib/config/RuntimeConfig');
const configGenerator = require('../lib/config-generator');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('../lib/webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const logger = require('../lib/logger');

const isWindows = (process.platform === 'win32');

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

    const config = new WebpackConfig(runtimeConfig);
    config.enableSingleRuntimeChunk();

    return config;
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

        it('addEntry and addEntries expectations are merged', () => {
            const config = createConfig();
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.addEntry('main', './main');
            config.addEntries({ main2: './main2' });

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.entry)).to.equal(JSON.stringify({
                main: './main',
                main2: './main2',
            }));
        });

        it('addStyleEntry and addEntries expectations are merged', () => {
            const config = createConfig();
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.addStyleEntry('style', ['./bootstrap.css', './main.css']);
            config.addEntries({ main: './main' });

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.entry)).to.equal(JSON.stringify({
                main: './main',
                style: ['./bootstrap.css', './main.css'],
            }));
        });

        it('addEntry, addStyleEntry and addEntries expectations are merged', () => {
            const config = createConfig();
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.addEntry('main', './main');
            config.addStyleEntry('style', ['./bootstrap.css', './main.css']);
            config.addEntries({ main2: './main2' });

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.entry)).to.equal(JSON.stringify({
                main: './main',
                main2: './main2',
                style: ['./bootstrap.css', './main.css'],
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
            expect(actualConfig.devtool).to.be.false;

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

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('"sourceMap":true');
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
            const manifestPlugin = findPlugin(WebpackManifestPlugin, actualConfig.plugins);
            // basePath matches publicPath, *without* the opening slash
            // we do that by convention: keys do not start with /
            expect(manifestPlugin.options.basePath).to.equal('build/');
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
            const manifestPlugin = findPlugin(WebpackManifestPlugin, actualConfig.plugins);
            // base path matches manifestKeyPrefix + trailing slash
            // the opening slash is kept, since the user is overriding this setting
            expect(manifestPlugin.options.basePath).to.equal('/build/');
        });

        it('manifestKeyPrefix can be empty', () => {
            const config = createConfig();
            config.outputPath = '/tmp/web/build';
            config.addEntry('main', './main');
            config.setPublicPath('/build');
            config.setManifestKeyPrefix('');

            const actualConfig = configGenerator(config);

            const manifestPlugin = findPlugin(WebpackManifestPlugin, actualConfig.plugins);
            expect(manifestPlugin.options.basePath).to.equal('');
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
            expect(actualConfig.output.filename).to.equal('[name].[contenthash:8].js');

            const miniCssPlugin = findPlugin(MiniCssExtractPlugin, actualConfig.plugins);

            expect(miniCssPlugin.options.filename).to.equal('[name].[contenthash:8].css');
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

            const definePlugin = findPlugin(webpack.DefinePlugin, actualConfig.plugins);
            expect(definePlugin.definitions['process.env'].NODE_ENV).to.equal('"development"');

            expect(actualConfig.optimization.minimizer).to.be.undefined;
        });

        it('YES to production', () => {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.environment = 'production';
            const config = createConfig(runtimeConfig);
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const definePlugin = findPlugin(webpack.DefinePlugin, actualConfig.plugins);
            expect(definePlugin.definitions['process.env'].NODE_ENV).to.equal('"production"');

            expect(actualConfig.optimization.minimizer[0]).to.not.be.undefined;
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

    describe('enableStylusLoader() adds the stylus-loader', () => {
        it('without enableStylusLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            // do not enable the stylus loader

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('stylus-loader');
        });

        it('enableStylusLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableStylusLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('stylus-loader');
        });
    });

    describe('enableHandlebarsLoader() adds the handlebars-loader', () => {

        it('without enableHandlebarsLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('handlebars-loader');
        });

        it('enableHandlebarsLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableHandlebarsLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('handlebars-loader');
        });
    });

    describe('enableEslintLoader() adds the eslint-loader', () => {
        it('without enableEslintLoader()', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('eslint-loader');
        });

        it('enableEslintLoader()', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('eslint-loader');
        });

        it('enableEslintLoader("extends-name")', () => {
            before(() => {
                logger.reset();
            });

            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintLoader('extends-name');

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(logger.getMessages().deprecation)).to.contain('enableEslintLoader: Extending from a configuration is deprecated, please use a configuration file instead. See https://eslint.org/docs/user-guide/configuring for more information.');
            expect(JSON.stringify(actualConfig.module.rules)).to.contain('eslint-loader');
            expect(JSON.stringify(actualConfig.module.rules)).to.contain('extends-name');
        });

        it('enableEslintLoader({extends: "extends-name"})', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintLoader({ extends: 'extends-name' });

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('eslint-loader');
            expect(JSON.stringify(actualConfig.module.rules)).to.contain('extends-name');
        });

        it('enableEslintLoader((options) => ...)', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintLoader((options) => {
                options.extends = 'extends-name';
            });

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('eslint-loader');
            expect(JSON.stringify(actualConfig.module.rules)).to.contain('extends-name');
        });

        it('enableEslintLoader(() => {}, {lintVue: true})', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintLoader(() => {}, {
                lintVue: true,
            });

            const actualConfig = configGenerator(config);
            expect(JSON.stringify(actualConfig.module.rules)).to.contain('eslint-loader');

            const eslintRule = findRule(/\.(jsx?|vue)$/, actualConfig.module.rules);
            expect(eslintRule.test.toString()).to.equal(/\.(jsx?|vue)$/.toString());
        });
    });

    describe('enableEslintPlugin() adds the eslint-webpack-plugin', () => {
        it('without enableEslintPlugin()', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';

            const actualConfig = configGenerator(config);

            const eslintPlugin = findPlugin(ESLintWebpackPlugin, actualConfig.plugins);
            expect(eslintPlugin).to.be.undefined;
        });

        it('enableEslintPlugin()', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintPlugin();

            const actualConfig = configGenerator(config);

            const eslintPlugin = findPlugin(ESLintWebpackPlugin, actualConfig.plugins);
            expect(eslintPlugin).to.not.be.undefined;
        });

        it('enableEslintPlugin({baseConfig: {extends: "extends-name"}})', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintPlugin({ baseConfig: { extends: 'extends-name' } });

            const actualConfig = configGenerator(config);

            const eslintPlugin = findPlugin(ESLintWebpackPlugin, actualConfig.plugins);
            expect(eslintPlugin.options.baseConfig.extends).to.equal('extends-name');
        });

        it('enableEslintPlugin((options) => ...)', () => {
            const config = createConfig();
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.enableEslintPlugin((options) => {
                options.extensions.push('vue');
            });

            const actualConfig = configGenerator(config);

            const eslintPlugin = findPlugin(ESLintWebpackPlugin, actualConfig.plugins);
            expect(eslintPlugin.options.extensions).to.deep.equal(['js', 'jsx', 'vue']);
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

    describe('enableVueLoader() with runtimeCompilerBuild sets Vue alias', () => {
        it('defaults to "true"', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.enableSingleRuntimeChunk();
            config.enableVueLoader(() => {}, { version: 3 });

            const actualConfig = configGenerator(config);

            expect(actualConfig.resolve.alias).to.deep.equals({
                'vue$': 'vue/dist/vue.esm-bundler.js',
            });
        });

        it('no alias for false', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.enableSingleRuntimeChunk();
            config.enableVueLoader(() => {}, { version: 3, runtimeCompilerBuild: false });

            const actualConfig = configGenerator(config);

            expect(actualConfig.resolve.alias).to.deep.empty;
        });
    });

    describe('addAliases() adds new aliases', () => {
        it('without addAliases()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';

            const actualConfig = configGenerator(config);

            expect(actualConfig.resolve.alias).to.deep.equals({});
        });

        it('with addAliases()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addAliases({
                'testA': 'src/testA',
                'testB': 'src/testB'
            });

            const actualConfig = configGenerator(config);

            expect(actualConfig.resolve.alias).to.deep.equals({
                'testA': 'src/testA',
                'testB': 'src/testB'
            });
        });

        it('with addAliases() that overwrites pre-defined aliases', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.enableVueLoader(() => {}, { version: 2 }); // Adds the 'vue$' alias
            config.enablePreactPreset({ preactCompat: true }); // Adds the 'react' and 'react-dom' aliases
            config.addAliases({
                'foo': 'bar',
                'vue$': 'new-vue$',
                'react-dom': 'new-react-dom',
            });

            const actualConfig = configGenerator(config);

            expect(actualConfig.resolve.alias).to.deep.equals({
                'foo': 'bar',
                'vue$': 'new-vue$',
                'react-dom': 'new-react-dom',
                'react': 'preact-compat' // Keeps predefined aliases that are not overwritten
            });
        });
    });

    describe('addExternals() adds new externals', () => {
        it('without addExternals()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';

            const actualConfig = configGenerator(config);

            expect(actualConfig.externals).to.deep.equals([]);
        });

        it('with addExternals()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addExternals({
                'jquery': 'jQuery',
                'react': 'react'
            });

            const actualConfig = configGenerator(config);

            expect(actualConfig.externals).to.deep.equals([{
                'jquery': 'jQuery',
                'react': 'react'
            }]);
        });
    });

    describe('.js rule receives different configuration', () => {
        it('Use default config', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.(m?jsx?)$/, actualConfig.module.rules);

            // check for the default env preset only
            expect(JSON.stringify(jsRule.use[0].options.presets)).contains('@babel/preset-env');
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

        it('devServer with custom options', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerPort = 9090;
            config.outputPath = isWindows ? 'C:\\tmp\\public' : '/tmp/public';
            config.setPublicPath('/');
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            expect(actualConfig.devServer).to.containSubset({
                static: {
                    directory: isWindows ? 'C:\\tmp\\public' : '/tmp/public',
                },
            });

            // this should be set when running the config generator
            expect(config.runtimeConfig.devServerFinalIsHttps).is.false;
        });

        it('devServer enabled only at the command line', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerHttps = true;
            config.outputPath = isWindows ? 'C:\\tmp\\public' : '/tmp/public';
            config.setPublicPath('/');
            config.addEntry('main', './main');

            configGenerator(config);
            // this should be set when running the config generator
            expect(config.runtimeConfig.devServerFinalIsHttps).is.true;
        });

        it('devServer enabled only via config', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.outputPath = isWindows ? 'C:\\tmp\\public' : '/tmp/public';
            config.setPublicPath('/');
            config.addEntry('main', './main');
            config.configureDevServerOptions(options => {
                options.https = {
                    key: 'https.key',
                    cert: 'https.cert',
                };
            });

            const actualConfig = configGenerator(config);

            expect(actualConfig.devServer).to.containSubset({
                https: {
                    key: 'https.key',
                    cert: 'https.cert',
                },
            });

            // this should be set when running the config generator
            expect(config.runtimeConfig.devServerFinalIsHttps).is.true;
        });
    });

    describe('test for addPlugin config', () => {
        function CustomPlugin1() {}
        function CustomPlugin2() {}
        function CustomPlugin3() {}

        it('extra plugin is set correctly', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.addPlugin(new webpack.IgnorePlugin({
                contextRegExp: /^\.\/locale$/,
                resourceRegExp: /moment$/
            }));

            const actualConfig = configGenerator(config);

            const ignorePlugin = findPlugin(webpack.IgnorePlugin, actualConfig.plugins);
            expect(ignorePlugin).to.not.be.undefined;
        });

        it('by default custom plugins are added after the last plugin with a priority of 0 and are kept in order', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.addPlugin(new CustomPlugin1());
            config.addPlugin(new CustomPlugin2());
            config.addPlugin(new CustomPlugin3());

            const actualConfig = configGenerator(config);
            const plugins = actualConfig.plugins;

            expect(plugins[plugins.length - 4]).to.be.instanceof(CustomPlugin1);
            expect(plugins[plugins.length - 3]).to.be.instanceof(CustomPlugin2);
            expect(plugins[plugins.length - 2]).to.be.instanceof(CustomPlugin3);
        });

        it('plugins can be sorted relatively to each other', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.addPlugin(new CustomPlugin1(), 2000);
            config.addPlugin(new CustomPlugin2(), -1000);
            config.addPlugin(new CustomPlugin3(), 1000);

            const actualConfig = configGenerator(config);
            const plugins = actualConfig.plugins;

            expect(plugins[0]).to.be.instanceof(CustomPlugin1);
            expect(plugins[1]).to.be.instanceof(CustomPlugin3);
            expect(plugins[plugins.length - 1]).to.be.instanceof(CustomPlugin2);
        });
    });

    describe('Test filenames changes', () => {
        it('without versioning', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureFilenames({
                js: '[name].foo.js',
                css: '[name].foo.css',
                assets: '[name].assets[ext]',
            });

            const actualConfig = configGenerator(config);
            expect(actualConfig.output.filename).to.equal('[name].foo.js');

            expect(actualConfig.output.assetModuleFilename).to.equal('[name].assets[ext]');

            const miniCssExtractPlugin = findPlugin(MiniCssExtractPlugin, actualConfig.plugins);
            expect(miniCssExtractPlugin.options.filename).to.equal('[name].foo.css');
        });

        it('with versioning', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableVersioning();
            config.configureFilenames({
                js: '[name].foo.js',
                css: '[name].foo.css',
                assets: '[name].assets[ext]',
            });

            const actualConfig = configGenerator(config);
            expect(actualConfig.output.filename).to.equal('[name].foo.js');

            expect(actualConfig.output.assetModuleFilename).to.equal('[name].assets[ext]');

            const miniCssExtractPlugin = findPlugin(MiniCssExtractPlugin, actualConfig.plugins);
            expect(miniCssExtractPlugin.options.filename).to.equal('[name].foo.css');
        });
    });

    describe('configuration for assets (images and fonts)', () => {
        it('no custom config', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const imagesRule = findRule(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/, actualConfig.module.rules).oneOf[1];
            expect(imagesRule.type).to.equal('asset/resource');
            expect(imagesRule.generator).to.eql({ filename: 'images/[name].[hash:8][ext]' });
            expect(imagesRule.parser).to.eql({});
            expect(imagesRule).to.include.keys('type', 'generator', 'parser');

            const fontsRule = findRule(/\.(woff|woff2|ttf|eot|otf)$/, actualConfig.module.rules).oneOf[1];
            expect(fontsRule.type).to.equal('asset/resource');
            expect(fontsRule.generator).to.eql({ filename: 'fonts/[name].[hash:8][ext]' });
        });

        it('with configureImageRule() custom options', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureImageRule({
                type: 'asset/resource',
                filename: 'file.[hash][ext]'
            });

            const actualConfig = configGenerator(config);

            const imagesRule = findRule(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/, actualConfig.module.rules).oneOf[1];
            expect(imagesRule.type).to.equal('asset/resource');
            expect(imagesRule.generator).to.eql({ filename: 'file.[hash][ext]' });
        });

        it('with configureImageRule() and maxSize', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureImageRule({
                type: 'asset',
                maxSize: 3000,
            });

            const actualConfig = configGenerator(config);

            const imagesRule = findRule(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/, actualConfig.module.rules).oneOf[1];
            expect(imagesRule.parser).to.eql({ dataUrlCondition: { maxSize: 3000 } });
        });

        it('with configureImageRule() disabled', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureImageRule({
                enabled: false,
            });

            const actualConfig = configGenerator(config);

            expect(function() {
                findRule(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/, actualConfig.module.rules);
            }).to.throw();
        });
    });

    describe('Test preact preset', () => {
        describe('Without preact-compat', () => {
            it('enablePreactPreset() does not add aliases to use preact-compat', () => {
                const config = createConfig();
                config.outputPath = '/tmp/public/build';
                config.setPublicPath('/build/');
                config.enablePreactPreset();

                const actualConfig = configGenerator(config);
                expect(actualConfig.resolve.alias).to.not.include.keys('react', 'react-dom');
            });
        });

        describe('With preact-compat', () => {
            it('enablePreactPreset({ preactCompat: true }) adds aliases to use preact-compat', () => {
                const config = createConfig();
                config.outputPath = '/tmp/public/build';
                config.setPublicPath('/build/');
                config.enablePreactPreset({ preactCompat: true });

                const actualConfig = configGenerator(config);
                expect(actualConfig.resolve.alias).to.include.keys('react', 'react-dom');
                expect(actualConfig.resolve.alias['react']).to.equal('preact-compat');
                expect(actualConfig.resolve.alias['react-dom']).to.equal('preact-compat');
            });
        });
    });

    describe('Test enableBuildCache()', () => {
        it('with full arguments', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableBuildCache({ config: ['foo.js'] }, (cache) => {
                cache.version = 5;
            });

            const actualConfig = configGenerator(config);
            expect(actualConfig.cache).to.eql({
                type: 'filesystem',
                buildDependencies: { config: ['foo.js'] },
                version: 5
            });
        });

        it('with sourcemaps', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useSourceMaps = true;

            const actualConfig = configGenerator(config);
            expect(actualConfig.devtool).to.equal('inline-source-map');

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('"sourceMap":true');
        });
    });

    describe('Test configureBabel()', () => {
        it('without configureBabel()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.(m?jsx?)$/, actualConfig.module.rules);
            expect(String(jsRule.exclude)).to.equal(String(/(node_modules|bower_components)/));

            const babelLoader = jsRule.use.find(loader => /babel-loader/.test(loader.loader));
            const babelEnvPreset = babelLoader.options.presets.find(([name]) => name === '@babel/preset-env');
            expect(babelEnvPreset[1].useBuiltIns).to.equal(false);
        });

        it('with configureBabel() and a different exclude rule', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureBabel(() => {}, {
                exclude: /foo/
            });

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.(m?jsx?)$/, actualConfig.module.rules);
            expect(String(jsRule.exclude)).to.equal(String(/foo/));
        });

        it('with configureBabel() and some whitelisted modules', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureBabel(() => {}, {
                includeNodeModules: ['foo']
            });

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.(m?jsx?)$/, actualConfig.module.rules);
            expect(jsRule.exclude).to.be.a('Function');
            expect(jsRule.exclude(path.join('test', 'node_modules', 'foo', 'index.js'))).to.be.false;
            expect(jsRule.exclude(path.join('test', 'node_modules', 'bar', 'index.js'))).to.be.true;
        });

        it('with configureBabel() and a different useBuiltIns value', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureBabel(() => { }, {
                useBuiltIns: 'usage',
                corejs: 3,
            });

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.(m?jsx?)$/, actualConfig.module.rules);
            const babelLoader = jsRule.use.find(loader => /babel-loader/.test(loader.loader));
            const babelEnvPreset = babelLoader.options.presets.find(([name]) => name === '@babel/preset-env');
            expect(babelEnvPreset[1].useBuiltIns).to.equal('usage');
            expect(babelEnvPreset[1].corejs).to.equal(3);
        });
    });

    describe('Test configureBabelPresetEnv()', () => {
        it('without configureBabelPresetEnv()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.(m?jsx?)$/, actualConfig.module.rules);
            const babelLoader = jsRule.use.find(loader => /babel-loader/.test(loader.loader));
            const babelEnvPreset = babelLoader.options.presets.find(([name]) => name === '@babel/preset-env');
            expect(babelEnvPreset[1].useBuiltIns).to.equal(false);
        });

        it('with configureBabelPresetEnv()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureBabelPresetEnv(options => {
                options.useBuiltIns = 'usage';
            });

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.(m?jsx?)$/, actualConfig.module.rules);
            const babelLoader = jsRule.use.find(loader => /babel-loader/.test(loader.loader));
            const babelEnvPreset = babelLoader.options.presets.find(([name]) => name === '@babel/preset-env');
            expect(babelEnvPreset[1].useBuiltIns).to.equal('usage');
        });
    });

    describe('Test shouldSplitEntryChunks', () => {
        const config = createConfig();
        config.outputPath = '/tmp/public/build';
        config.setPublicPath('/build/');
        config.splitEntryChunks();

        const actualConfig = configGenerator(config);
        expect(actualConfig.optimization.splitChunks.chunks).to.equal('all');
        expect(actualConfig.optimization.splitChunks.name).to.be.undefined;
    });

    describe('Test shouldUseSingleRuntimeChunk', () => {
        before(() => {
            logger.reset();
            logger.quiet();
        });

        after(() => {
            logger.quiet(false);
        });

        it('Set to true', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.enableSingleRuntimeChunk();

            const actualConfig = configGenerator(config);
            expect(actualConfig.optimization.runtimeChunk).to.equal('single');
            expect(logger.getMessages().deprecation).to.be.empty;
        });

        it('Set to false', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.disableSingleRuntimeChunk();

            const actualConfig = configGenerator(config);
            expect(actualConfig.optimization.runtimeChunk).to.be.undefined;
            expect(logger.getMessages().deprecation).to.be.empty;
        });

        it('Not set should throw an error', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.shouldUseSingleRuntimeChunk = null;
            config.setPublicPath('/build/');

            expect(() => configGenerator(config)).to.throw('Either the Encore.enableSingleRuntimeChunk() or Encore.disableSingleRuntimeChunk() method should be called');
        });
    });

    describe('Test buildWatchOptionsConfig()', () => {
        it('Set webpack watch options', () => {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.configureWatchOptions(watchOptions => {
                watchOptions.poll = 250;
            });

            const actualConfig = configGenerator(config);
            expect(actualConfig.watchOptions).to.deep.equals({
                ignored: /node_modules/,
                poll: 250,
            });
        });
    });

    describe('Test configureLoaderRule()', () => {
        let config;

        beforeEach(() => {
            config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/');
            config.enableSingleRuntimeChunk();
        });

        it('configure rule for "javascript"', () => {
            config.configureLoaderRule('javascript', (loaderRule) => {
                loaderRule.test = /\.m?js$/;
                loaderRule.use[0].options.fooBar = 'fooBar';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.m?js$/, webpackConfig.module.rules);

            expect('file.js').to.match(rule.test);
            expect('file.mjs').to.match(rule.test);
            expect(rule.use[0].options.fooBar).to.equal('fooBar');
        });

        it('configure rule for the alias "js"', () => {
            config.configureLoaderRule('js', (loaderRule) => {
                loaderRule.test = /\.m?js$/;
                loaderRule.use[0].options.fooBar = 'fooBar';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.m?js$/, webpackConfig.module.rules);

            expect('file.js').to.match(rule.test);
            expect('file.mjs').to.match(rule.test);
            expect(rule.use[0].options.fooBar).to.equal('fooBar');
        });

        it('configure rule for "css"', () => {
            config.configureLoaderRule('css', (loaderRule) => {
                loaderRule.camelCase = true;
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.(css)$/, webpackConfig.module.rules);

            expect(rule.camelCase).to.be.true;
        });

        it('configure rule for "images"', () => {
            config.configureLoaderRule('images', (loaderRule) => {
                loaderRule.oneOf[1].generator.filename = 'dirname-images/[hash:42][ext]';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/, webpackConfig.module.rules).oneOf[1];

            expect(rule.generator.filename).to.equal('dirname-images/[hash:42][ext]');
        });

        it('configure rule for "fonts"', () => {
            config.configureLoaderRule('fonts', (loader) => {
                loader.oneOf[1].generator.filename = 'dirname-fonts/[hash:42][ext]';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.(woff|woff2|ttf|eot|otf)$/, webpackConfig.module.rules).oneOf[1];

            expect(rule.generator.filename).to.equal('dirname-fonts/[hash:42][ext]');
        });

        it('configure rule for "sass"', () => {
            config.enableSassLoader();
            config.configureLoaderRule('sass', (loaderRule) => {
                loaderRule.oneOf[1].use[2].options.fooBar = 'fooBar';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.s[ac]ss$/, webpackConfig.module.rules);

            expect(rule.oneOf[1].use[2].options.fooBar).to.equal('fooBar');
        });

        it('configure rule for the alias "scss"', () => {
            config.enableSassLoader();
            config.configureLoaderRule('scss', (loaderRule) => {
                loaderRule.oneOf[1].use[2].options.fooBar = 'fooBar';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.s[ac]ss$/, webpackConfig.module.rules);

            expect(rule.oneOf[1].use[2].options.fooBar).to.equal('fooBar');
        });

        it('configure rule for "less"', () => {
            config.enableLessLoader((options) => {
                options.optionA = 'optionA';
            });
            config.configureLoaderRule('less', (loaderRule) => {
                loaderRule.oneOf[1].use[2].options.optionB = 'optionB';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.less/, webpackConfig.module.rules);

            expect(rule.oneOf[1].use[2].options.optionA).to.equal('optionA');
            expect(rule.oneOf[1].use[2].options.optionB).to.equal('optionB');
        });

        it('configure rule for "stylus"', () => {
            config.enableStylusLoader((options) => {
                options.optionA = 'optionA';
            });
            config.configureLoaderRule('stylus', (loaderRule) => {
                loaderRule.oneOf[1].use[2].options.optionB = 'optionB';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.styl/, webpackConfig.module.rules);

            expect(rule.oneOf[1].use[2].options.optionA).to.equal('optionA');
            expect(rule.oneOf[1].use[2].options.optionB).to.equal('optionB');
        });

        it('configure rule for "vue"', () => {
            config.enableVueLoader((options) => {
                options.shadowMode = true;
            });
            config.configureLoaderRule('vue', (loaderRule) => {
                loaderRule.use[0].options.prettify = false;
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.vue$/, webpackConfig.module.rules);

            expect(rule.use[0].options.shadowMode).to.be.true;
            expect(rule.use[0].options.prettify).to.be.false;
        });

        it('configure rule for "eslint"', () => {
            config.enableEslintLoader((options) => {
                options.extends = 'airbnb';
            });
            config.configureLoaderRule('eslint', (loaderRule) => {
                loaderRule.test = /\.(jsx?|vue)/;
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.(jsx?|vue)/, webpackConfig.module.rules);

            expect(rule.options.extends).to.equal('airbnb');
            expect('file.js').to.match(rule.test);
            expect('file.jsx').to.match(rule.test);
            expect('file.vue').to.match(rule.test);
        });

        it('configure rule for "typescript" and "ts"', () => {
            config.enableTypeScriptLoader((options) => {
                options.silent = true;
            });
            config.configureLoaderRule('typescript', (loaderRule) => {
                loaderRule.use[1].options.happyPackMode = true;
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.tsx?$/, webpackConfig.module.rules);

            expect(rule.use[1].options.silent).to.be.true;
            expect(rule.use[1].options.happyPackMode).to.be.true;
        });

        it('configure rule for the alias "ts"', () => {
            config.enableTypeScriptLoader((options) => {
                options.silent = true;
            });
            config.configureLoaderRule('ts', (loaderRule) => {
                loaderRule.use[1].options.happyPackMode = true;
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.tsx?$/, webpackConfig.module.rules);

            expect(rule.use[1].options.silent).to.be.true;
            expect(rule.use[1].options.happyPackMode).to.be.true;
        });

        it('configure rule for "handlebars"', () => {
            config.enableHandlebarsLoader((options) => {
                options.debug = true;
            });
            config.configureLoaderRule('handlebars', (loaderRule) => {
                loaderRule.use[0].options.fooBar = 'fooBar';
            });

            const webpackConfig = configGenerator(config);
            const rule = findRule(/\.(handlebars|hbs)$/, webpackConfig.module.rules);

            expect(rule.use[0].options.debug).to.be.true;
            expect(rule.use[0].options.fooBar).to.be.equal('fooBar');
        });
    });

    describe('enablePostCssLoader() makes the CSS rule process .postcss file', () => {
        it('without enablePostCssLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.enableSingleRuntimeChunk();
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            expect(function() {
                findRule(/\.(css)$/, actualConfig.module.rules);
            }).not.to.throw();
            expect(function() {
                findRule(/\.(css|pcss|postcss)$/, actualConfig.module.rules);
            }).to.throw();
        });

        it('with enablePostCssLoader()', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableSingleRuntimeChunk();
            config.enablePostCssLoader();

            const actualConfig = configGenerator(config);

            expect(function() {
                findRule(/\.(css)$/, actualConfig.module.rules);
            }).to.throw();
            expect(function() {
                findRule(/\.(css|pcss|postcss)$/, actualConfig.module.rules);
            }).to.not.throw();
        });
    });

    describe('Test addCacheGroup()', () => {
        it('Calling it adds cache groups', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.enableSingleRuntimeChunk();
            config.addEntry('main', './main');
            config.addCacheGroup('foo', { test: /foo/ });
            config.addCacheGroup('bar', { test: /bar/ });

            const actualConfig = configGenerator(config);

            expect(actualConfig.optimization.splitChunks.cacheGroups).to.deep.equal({
                foo: { name: 'foo', test: /foo/, chunks: 'all', enforce: true },
                bar: { name: 'bar', test: /bar/, chunks: 'all', enforce: true },
            });
        });

        it('Calling it using the "node_modules" option', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.enableSingleRuntimeChunk();
            config.addEntry('main', './main');
            config.addCacheGroup('foo', { node_modules: ['foo','bar', 'baz'] });

            const actualConfig = configGenerator(config);

            expect(actualConfig.optimization.splitChunks.cacheGroups).to.deep.equal({
                foo: {
                    name: 'foo',
                    test: /[\\/]node_modules[\\/](foo|bar|baz)[\\/]/,
                    chunks: 'all',
                    enforce: true,
                },
            });
        });

        it('Calling it and overriding default options', () => {
            const config = createConfig();
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.enableSingleRuntimeChunk();
            config.addEntry('main', './main');
            config.addCacheGroup('foo', {
                name: 'bar',
                test: /foo/,
                chunks: 'initial',
                minChunks: 2,
                enforce: false,
            });

            const actualConfig = configGenerator(config);

            expect(actualConfig.optimization.splitChunks.cacheGroups).to.deep.equal({
                foo: {
                    name: 'bar',
                    test: /foo/,
                    chunks: 'initial',
                    minChunks: 2,
                    enforce: false,
                },
            });
        });
    });
});

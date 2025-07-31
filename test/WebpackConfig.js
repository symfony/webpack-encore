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
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const logger = require('../lib/logger');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('WebpackConfig object', function() {

    describe('setOutputPath', function() {
        const removeDirectory = (targetPath) => {
            if (fs.existsSync(targetPath)) {
                const files = fs.readdirSync(targetPath);
                for (const file of files) {
                    const filePath = path.resolve(targetPath, file);
                    if (fs.lstatSync(filePath).isDirectory()) {
                        removeDirectory(filePath);
                    } else {
                        fs.unlinkSync(filePath);
                    }
                }

                fs.rmdirSync(targetPath);
            }
        };

        // Make sure the newly created directories are removed
        // before and after each test
        const cleanupNewDirectories = () => {
            removeDirectory(path.resolve(__dirname, 'new_dir'));
            removeDirectory(path.resolve(__dirname, '..', 'new_dir'));
        };

        beforeEach(cleanupNewDirectories);

        afterEach(cleanupNewDirectories);

        it('use absolute, existent path', function() {
            const config = createConfig();
            config.setOutputPath(__dirname);

            expect(config.outputPath).to.equal(__dirname);
        });

        it('relative path, becomes absolute', function() {
            const config = createConfig();
            config.setOutputPath('new_dir');

            // __dirname is the context
            expect(config.outputPath).to.equal(
                path.join(__dirname, '/new_dir')
            );
        });

        it('non-existent path creates directory', function() {
            const targetPath = path.join(__dirname, 'new_dir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            config.setOutputPath(targetPath);
            expect(fs.existsSync(config.outputPath)).to.be.true;
        });

        it('non-existent directory, 3 levels deep is created correctly', function() {
            var targetPath = path.join(__dirname, 'new_dir', 'subdir1', 'subdir2');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            config.setOutputPath(targetPath);
            expect(fs.existsSync(config.outputPath)).to.be.true;
        });

        it('non-existent path outside of the context directory works if only one directory has to be created', function() {
            var targetPath = path.join(__dirname, '..', 'new_dir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            config.setOutputPath(targetPath);
            expect(fs.existsSync(config.outputPath)).to.be.true;
        });

        it('non-existent path outside of the context directory throws an error if more than one directory has to be created', function() {
            var targetPath = path.join(__dirname, '..', 'new_dir', 'subdir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            expect(() => config.setOutputPath(targetPath)).to.throw('create this directory');
        });
    });

    describe('setPublicPath', function() {
        it('/foo => /foo/', function() {
            const config = createConfig();
            config.setPublicPath('/foo');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('/foo/ => /foo/', function() {
            const config = createConfig();
            config.setPublicPath('/foo/');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('https://example.com => https://example.com/', function() {
            const config = createConfig();
            config.setPublicPath('https://example.com');

            expect(config.publicPath).to.equal('https://example.com/');
        });

        it('You can omit the opening slash, but get a warning', function() {
            const config = createConfig();
            logger.reset();
            logger.quiet();

            config.setPublicPath('foo');
            expect(logger.getMessages().warning).to.have.lengthOf(1);
        });
    });

    describe('getRealPublicPath', function() {
        it('Returns normal with no dev server', function() {
            const config = createConfig();
            config.setPublicPath('/public');

            expect(config.getRealPublicPath()).to.equal('/public/');
        });

        it('Prefix when using devServer', function() {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerHost = 'localhost';
            config.runtimeConfig.devServerPort = 8080;
            config.runtimeConfig.devServerFinalIsHttps = false;
            config.setPublicPath('/public');

            expect(config.getRealPublicPath()).to.equal('http://localhost:8080/public/');
        });

        it('No prefix with devServer & devServerKeepPublicPath option', function() {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerHost = 'localhost';
            config.runtimeConfig.devServerPort = 8080;
            config.runtimeConfig.devServerFinalIsHttps = false;
            config.runtimeConfig.devServerKeepPublicPath = true;
            config.setPublicPath('/public');

            expect(config.getRealPublicPath()).to.equal('/public/');
        });

        it('devServer does not prefix if publicPath is absolute', function() {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerHost = 'localhost';
            config.runtimeConfig.devServerPort = 8080;
            config.runtimeConfig.devServerFinalIsHttps = false;
            config.setPublicPath('http://coolcdn.com/public');
            config.setManifestKeyPrefix('/public/');

            expect(config.getRealPublicPath()).to.equal('http://coolcdn.com/public/');
        });
    });

    describe('setManifestKeyPrefix', function() {

        it('You can set it!', function() {
            const config = createConfig();
            config.setManifestKeyPrefix('foo');

            // trailing slash added
            expect(config.manifestKeyPrefix).to.equal('foo/');
        });

        it('You can set it blank', function() {
            const config = createConfig();
            config.setManifestKeyPrefix('');

            // trailing slash not added
            expect(config.manifestKeyPrefix).to.equal('');
        });

        it('You can use an opening slash, but get a warning', function() {
            const config = createConfig();

            logger.reset();
            logger.quiet();
            config.setManifestKeyPrefix('/foo/');
            expect(logger.getMessages().warning).to.have.lengthOf(1);
        });
    });

    describe('cleanupOutputBeforeBuild', function() {
        it('Enabling it with default settings', function() {
            const config = createConfig();
            config.cleanupOutputBeforeBuild();

            expect(config.cleanupOutput).to.be.true;
        });

        it('Setting paths and callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.cleanupOutputBeforeBuild(callback);

            expect(config.cleanupOutput).to.be.true;
            expect(config.cleanOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', function() {
            const config = createConfig();

            expect(() => {
                config.cleanupOutputBeforeBuild('foo');
            }).to.throw('Argument 1 to cleanupOutputBeforeBuild() must be a callback function');
        });
    });

    describe('configureDefinePlugin', function() {
        it('Setting callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.configureDefinePlugin(callback);

            expect(config.definePluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', function() {
            const config = createConfig();

            expect(() => {
                config.configureDefinePlugin('foo');
            }).to.throw('Argument 1 to configureDefinePlugin() must be a callback function');
        });
    });

    describe('configureFriendlyErrorsPlugin', function() {
        it('Setting callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.configureFriendlyErrorsPlugin(callback);

            expect(config.friendlyErrorsPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', function() {
            const config = createConfig();

            expect(() => {
                config.configureFriendlyErrorsPlugin('foo');
            }).to.throw('Argument 1 to configureFriendlyErrorsPlugin() must be a callback function');
        });
    });

    describe('configureManifestPlugin', function() {
        it('Setting callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.configureManifestPlugin(callback);

            expect(config.manifestPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', function() {
            const config = createConfig();
            const callback = 'invalid';

            expect(() => {
                config.configureManifestPlugin(callback);
            }).to.throw('Argument 1 to configureManifestPlugin() must be a callback function');
        });
    });

    describe('configureTerserPlugin', function() {
        it('Setting callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.configureTerserPlugin(callback);

            expect(config.terserPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', function() {
            const config = createConfig();

            expect(() => {
                config.configureTerserPlugin('foo');
            }).to.throw('Argument 1 to configureTerserPlugin() must be a callback function');
        });
    });

    describe('configureCssMinimizerPlugin', function() {
        it('Setting callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.configureCssMinimizerPlugin(callback);

            expect(config.cssMinimizerPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', function() {
            const config = createConfig();

            expect(() => {
                config.configureCssMinimizerPlugin('foo');
            }).to.throw('Argument 1 to configureCssMinimizerPlugin() must be a callback function');
        });
    });

    describe('addEntry', function() {
        it('Calling with a duplicate entrypoint name throws an error', function() {
            const config = createConfig();
            config.addEntry('entry_foo', './foo.js');

            expect(() => {
                config.addEntry('entry_foo', './bar.js');
            }).to.throw('already exists as an Entrypoint');
        });

        it('Calling with a duplicate of addStyleEntry', function() {
            const config = createConfig();
            config.addStyleEntry('main', './main.scss');

            expect(() => {
                config.addEntry('main', './main.js');
            }).to.throw('already exists as a Style Entrypoint');
        });

        it('Calling with a duplicate of addEntries', function() {
            const config = createConfig();
            config.addEntries({ main: './foo.js' });

            expect(() => {
                config.addEntry('main', './bar.js');
            }).to.throw('already exists as an Entrypoint');
        });
    });

    describe('addEntries', function() {
        it('Calling with a duplicate entrypoint name throws an error', function() {
            const config = createConfig();
            config.addEntry('entry_foo', './foo.js');

            expect(() => {
                config.addEntries({ entry_foo: './bar.js' });
            }).to.throw('already exists as an Entrypoint');
        });

        it('Calling with a duplicate of addStyleEntry', function() {
            const config = createConfig();
            config.addStyleEntry('main', './main.scss');

            expect(() => {
                config.addEntries({ main: './main.js' });
            }).to.throw('already exists as a Style Entrypoint');
        });

        it('Calling with a duplicate of addEntries', function() {
            const config = createConfig();
            config.addEntries({ main: './foo.js' });

            expect(() => {
                config.addEntries({ main: './bar.js' });
            }).to.throw('already exists as an Entrypoint');
        });
    });

    describe('addStyleEntry', function() {
        it('Calling with a duplicate style entrypoint name throws an error', function() {
            const config = createConfig();
            config.addStyleEntry('entry_foo', './foo.css');

            expect(() => {
                config.addStyleEntry('entry_foo', './bar.css');
            }).to.throw('already exists as a Style Entrypoint');
        });

        it('Calling with a duplicate of addEntry', function() {
            const config = createConfig();
            config.addEntry('main', './main.scss');

            expect(() => {
                config.addStyleEntry('main', './main.js');
            }).to.throw('already exists as an Entrypoint');
        });

        it('Calling with a duplicate of addEntries', function() {
            const config = createConfig();
            config.addEntries({ main: './main.js' });

            expect(() => {
                config.addStyleEntry('main', './main.scss');
            }).to.throw('already exists as an Entrypoint');
        });
    });

    describe('addCacheGroup', function() {
        it('Calling it adds cache groups', function() {
            const config = createConfig();
            config.addCacheGroup('foo', { test: /foo/ });
            config.addCacheGroup('bar', { test: /bar/ });

            expect(config.cacheGroups).to.deep.equal({
                foo: { test: /foo/ },
                bar: { test: /bar/ },
            });
        });

        it('Calling it using the "node_modules" option', function() {
            const config = createConfig();
            config.addCacheGroup('foo', { node_modules: ['foo','bar', 'baz'] });

            expect(config.cacheGroups).to.deep.equal({
                foo: {
                    test: /[\\/]node_modules[\\/](foo|bar|baz)[\\/]/,
                },
            });
        });

        it('Calling it with other SplitChunksPlugin options', function() {
            const config = createConfig();
            config.addCacheGroup('foo', {
                test: /foo/,
                chunks: 'initial',
                minChunks: 2
            });

            expect(config.cacheGroups).to.deep.equal({
                foo: {
                    test: /foo/,
                    chunks: 'initial',
                    minChunks: 2
                },
            });
        });

        it('Calling it with an invalid name', function() {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup(true, { test: /foo/ });
            }).to.throw('must be a string');
        });

        it('Calling it with an invalid options parameter', function() {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup('foo', 'bar');
            }).to.throw('must be an object');
        });

        it('Calling it with an invalid node_modules option', function() {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup('foo', {
                    'node_modules': 'foo'
                });
            }).to.throw('must be an array');
        });

        it('Calling it without the "test" or "node_modules" option', function() {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup('foo', { type: 'json' });
            }).to.throw('Either the "test" option or the "node_modules" option');
        });
    });

    describe('copyFiles', function() {
        it('Calling it adds files to be copied', function() {
            const config = createConfig();

            // With multiple config objects
            config.copyFiles([
                { from: './foo', pattern: /.*/ },
                { from: './bar', pattern: '/abc/', to: 'bar', includeSubdirectories: false },
            ]);

            // With a single config object
            config.copyFiles({ from: './baz' });

            expect(config.copyFilesConfigs).to.deep.equal([{
                from: './foo',
                pattern: /.*/,
                to: null,
                includeSubdirectories: true,
                context: null,
            }, {
                from: './bar',
                pattern: '/abc/',
                to: 'bar',
                includeSubdirectories: false,
                context: null,
            }, {
                from: './baz',
                pattern: /.*/,
                to: null,
                includeSubdirectories: true,
                context: null,
            }]);
        });

        it('Calling it with an invalid parameter', function() {
            const config = createConfig();

            expect(() => {
                config.copyFiles('foo');
            }).to.throw('must be called with either a config object or an array of config objects');

            expect(() => {
                config.copyFiles([{ from: 'foo' }, 'foo']);
            }).to.throw('must be called with either a config object or an array of config objects');
        });

        it('Calling it with a missing from key', function() {
            const config = createConfig();

            expect(() => {
                config.copyFiles({ to: 'foo' });
            }).to.throw('must have a "from" property');

            expect(() => {
                config.copyFiles([{ from: 'foo' }, { to: 'foo' }]);
            }).to.throw('must have a "from" property');
        });

        it('Calling it with an unknown config property', function() {
            const config = createConfig();

            expect(() => {
                config.copyFiles({ from: 'images', foo: 'foo' });
            }).to.throw('Invalid config option "foo"');
        });

        it('Calling it with an invalid "pattern" option', function() {
            const config = createConfig();

            expect(() => {
                config.copyFiles({ from: 'images', pattern: true });
            }).to.throw('Invalid pattern "true"');

            expect(() => {
                config.copyFiles({ from: 'images', pattern: 'foo' });
            }).to.throw('Invalid pattern "foo"');
        });
    });

    describe('autoProvideVariables', function() {
        it('Calling multiple times merges', function() {
            const config = createConfig();
            config.autoProvideVariables({
                $: 'jquery',
                jQuery: 'jquery'
            });
            config.autoProvideVariables({
                bar: './bar',
                foo: './foo'
            });
            config.autoProvideVariables({
                foo: './foo2'
            });

            expect(JSON.stringify(config.providedVariables))
                .to.equal(JSON.stringify({
                    $: 'jquery',
                    jQuery: 'jquery',
                    bar: './bar',
                    foo: './foo2',
                }))
            ;
        });

        it('Calling with string throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.autoProvideVariables('jquery');
            }).to.throw('must pass an object');
        });

        it('Calling with an Array throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.autoProvideVariables(['jquery']);
            }).to.throw('must pass an object');
        });
    });

    describe('configureBabel', function() {
        beforeEach(function() {
            logger.reset();
            logger.quiet();
        });

        afterEach(function() {
            logger.quiet(false);
        });

        it('Calling method sets it', function() {
            const config = createConfig();
            const testCallback = () => {};
            config.configureBabel(testCallback);
            expect(config.babelConfigurationCallback).to.equal(testCallback);
            expect(String(config.babelOptions.exclude)).to.equal(String(/(node_modules|bower_components)/));
        });

        it('Calling with "exclude" option', function() {
            const config = createConfig();
            config.configureBabel(() => {}, { exclude: 'foo' });

            expect(config.babelOptions.exclude).to.equal('foo');
        });

        it('Calling with "includeNodeModules" option', function() {
            const config = createConfig();
            config.configureBabel(() => {}, { includeNodeModules: ['foo', 'bar'] });

            expect(config.babelOptions.exclude).to.be.a('Function');

            const includedPaths = [
                path.join('test', 'lib', 'index.js'),
                path.join('test', 'node_modules', 'foo', 'index.js'),
                path.join('test', 'node_modules', 'foo', 'lib', 'index.js'),
                path.join('test', 'node_modules', 'bar', 'lib', 'index.js'),
                path.join('test', 'node_modules', 'baz', 'node_modules', 'foo', 'index.js'),
            ];

            const excludedPaths = [
                path.join('test', 'bower_components', 'foo', 'index.js'),
                path.join('test', 'bower_components', 'bar', 'index.js'),
                path.join('test', 'bower_components', 'baz', 'index.js'),
                path.join('test', 'node_modules', 'baz', 'lib', 'index.js'),
                path.join('test', 'node_modules', 'baz', 'lib', 'foo', 'index.js')
            ];

            for (const filePath of includedPaths) {
                expect(config.babelOptions.exclude(filePath)).to.equal(false);
            }

            for (const filePath of excludedPaths) {
                expect(config.babelOptions.exclude(filePath)).to.equal(true);
            }
        });

        it('Calling with "useBuiltIns" option', function() {
            const config = createConfig();
            config.configureBabel(() => { }, { useBuiltIns: 'foo' });

            expect(config.babelOptions.useBuiltIns).to.equal('foo');
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureBabel('FOO');
            }).to.throw('must be a callback function');
        });

        it('Calling with a callback when .babelrc is present throws an error', function() {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;

            expect(() => {
                config.configureBabel(() => {});
            }).to.throw('your app already provides an external Babel configuration');
        });

        it('Calling with a whitelisted option when .babelrc is present works fine', function() {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;
            config.configureBabel(null, { includeNodeModules: ['foo'] });
            expect(logger.getMessages().warning).to.be.empty;
        });

        it('Calling with a non-whitelisted option when .babelrc is present displays a warning', function() {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;
            config.configureBabel(null, { useBuiltIns: 'foo' });

            const warnings = logger.getMessages().warning;
            expect(warnings).to.have.lengthOf(1);
            expect(warnings[0]).to.contain('your app already provides an external Babel configuration');
        });

        it('Pass invalid config', function() {
            const config = createConfig();

            expect(() => {
                config.configureBabel(() => {}, { fake_option: 'foo' });
            }).to.throw('Invalid option "fake_option" passed to configureBabel()');
        });

        it('Calling with both "includeNodeModules" and "exclude" options', function() {
            const config = createConfig();

            expect(() => {
                config.configureBabel(() => {}, { exclude: 'foo', includeNodeModules: ['bar', 'baz'] });
            }).to.throw('can\'t be used together');
        });

        it('Calling with an invalid "includeNodeModules" option value', function() {
            const config = createConfig();

            expect(() => {
                config.configureBabel(() => {}, { includeNodeModules: 'foo' });
            }).to.throw('must be an Array');
        });
    });

    describe('configureBabelPresetEnv', function() {
        beforeEach(function() {
            logger.reset();
            logger.quiet();
        });

        afterEach(function() {
            logger.quiet(false);
        });

        it('Calling method sets it', function() {
            const config = createConfig();
            const testCallback = () => {};
            config.configureBabelPresetEnv(testCallback);
            expect(config.babelPresetEnvOptionsCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureBabelPresetEnv('FOO');
            }).to.throw('must be a callback function');
        });

        it('Calling with a callback when .babelrc is present throws an error', function() {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;

            expect(() => {
                config.configureBabelPresetEnv(() => {});
            }).to.throw('your app already provides an external Babel configuration');
        });
    });

    describe('configureCssLoader', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            const testCallback = () => {};
            config.configureCssLoader(testCallback);
            expect(config.cssLoaderConfigurationCallback).to.equal(testCallback);

        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureCssLoader('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('configureMiniCssExtractPlugin', function() {
        it('Calling method with its first parameter sets the loader\'s options', function() {
            const config = createConfig();
            const testCallback = () => {};
            config.configureMiniCssExtractPlugin(testCallback);
            expect(config.miniCssExtractLoaderConfigurationCallback).to.equal(testCallback);
        });

        it('Calling method with its second parameter sets the plugin\'s options', function() {
            const config = createConfig();
            const testCallbackLoader = () => {};
            const testCallbackPlugin = () => {};
            config.configureMiniCssExtractPlugin(testCallbackLoader, testCallbackPlugin);
            expect(config.miniCssExtractLoaderConfigurationCallback).to.equal(testCallbackLoader);
            expect(config.miniCssExtractPluginConfigurationCallback).to.equal(testCallbackPlugin);
        });

        it('Calling with non-callback as 1st parameter throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureMiniCssExtractPlugin('FOO');
            }).to.throw('must be a callback function');
        });

        it('Calling with non-callback as 2nd parameter throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureMiniCssExtractPlugin(() => {}, 'FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('configureSplitChunks', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            const testCallback = () => {};
            config.configureSplitChunks(testCallback);
            expect(config.splitChunksConfigurationCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureSplitChunks('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('enablePostCssLoader', function() {
        it('Call with no config', function() {
            const config = createConfig();
            config.enablePostCssLoader();

            expect(config.usePostCssLoader).to.be.true;
        });

        it('Pass options callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.enablePostCssLoader(callback);

            expect(config.usePostCssLoader).to.be.true;
            expect(config.postCssLoaderOptionsCallback).to.equal(callback);
        });

        it('Pass invalid options callback', function() {
            const config = createConfig();

            expect(() => config.enablePostCssLoader('FOO')).to.throw('must be a callback function');
        });
    });

    describe('enableSassLoader', function() {
        it('Call with no config', function() {
            const config = createConfig();
            config.enableSassLoader();

            expect(config.useSassLoader).to.be.true;
        });

        it('Pass valid config', function() {
            const config = createConfig();
            config.enableSassLoader(() => {}, { resolveUrlLoader: false });

            expect(config.useSassLoader).to.be.true;
            expect(config.sassOptions.resolveUrlLoader).to.be.false;
        });

        it('Pass invalid config', function() {
            const config = createConfig();

            expect(() => {
                config.enableSassLoader(() => {}, { fake_option: false });
            }).to.throw('Invalid option "fake_option" passed to enableSassLoader()');
        });

        it('Pass options callback', function() {
            const config = createConfig();
            const callback = (options) => {};
            config.enableSassLoader(callback);

            expect(config.sassLoaderOptionsCallback).to.equal(callback);
        });
    });

    describe('enableLessLoader', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            config.enableLessLoader();

            expect(config.useLessLoader).to.be.true;
        });

        it('Calling with callback', function() {
            const config = createConfig();
            const callback = (lessOptions) => {};
            config.enableLessLoader(callback);

            expect(config.lessLoaderOptionsCallback).to.equal(callback);
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.enableLessLoader('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('enableStylusLoader', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            config.enableStylusLoader();

            expect(config.useStylusLoader).to.be.true;
        });

        it('Calling with callback', function() {
            const config = createConfig();
            const callback = (stylusOptions) => {};
            config.enableStylusLoader(callback);

            expect(config.stylusLoaderOptionsCallback).to.equal(callback);
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.enableStylusLoader('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('enableBuildCache', function() {
        it('Calling method enables it', function() {
            const config = createConfig();
            config.enableBuildCache({ config: ['foo.js'] });

            expect(config.usePersistentCache).to.be.true;
            expect(config.persistentCacheBuildDependencies).to.eql({ config: ['foo.js'] });
        });

        it('Calling with callback', function() {
            const config = createConfig();
            const callback = (cache) => {};
            config.enableBuildCache({ config: ['foo.js'] }, callback);

            expect(config.persistentCacheCallback).to.equal(callback);
        });

        it('Calling without config key throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.enableBuildCache({});
            }).to.throw('should contain an object with at least a "config" key');
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.enableBuildCache({ config: ['foo.js'] }, 'FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('enableReactPreset', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            const testCallback = () => {};
            config.enableReactPreset(testCallback);
            expect(config.babelReactPresetOptionsCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.enableReactPreset('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('enablePreactPreset', function() {
        it('Without preact-compat', function() {
            const config = createConfig();
            config.enablePreactPreset();

            expect(config.usePreact).to.be.true;
            expect(config.preactOptions.preactCompat).to.be.false;
        });

        it('With preact-compat', function() {
            const config = createConfig();
            config.enablePreactPreset({
                preactCompat: true
            });

            expect(config.usePreact).to.be.true;
            expect(config.preactOptions.preactCompat).to.be.true;
        });

        it('With an invalid option', function() {
            const config = createConfig();
            expect(() => {
                config.enablePreactPreset({
                    foo: true
                });
            }).to.throw('Invalid option "foo"');
        });
    });

    describe('enableTypeScriptLoader', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            const testCallback = () => {};
            config.enableTypeScriptLoader(testCallback);
            expect(config.tsConfigurationCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.enableTypeScriptLoader('FOO');
            }).to.throw('must be a callback function');
        });

        it('TypeScript can not be compiled by ts-loader if Babel is already handling TypeScript', function() {
            const config = createConfig();
            config.enableBabelTypeScriptPreset();

            expect(function() {
                config.enableTypeScriptLoader();
            }).to.throw('Encore.enableTypeScriptLoader() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        });
    });

    describe('enableForkedTypeScriptTypesChecking', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            config.enableTypeScriptLoader();
            const testCallback = () => {};
            config.enableForkedTypeScriptTypesChecking(testCallback);
            expect(config.forkedTypeScriptTypesCheckOptionsCallback)
                .to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.enableForkedTypeScriptTypesChecking('FOO');
            }).to.throw('must be a callback function');
        });

        it('TypeScript can not be compiled by Babel if forked types checking is enabled', function() {
            const config = createConfig();
            config.enableBabelTypeScriptPreset();

            expect(function() {
                config.enableForkedTypeScriptTypesChecking();
            }).to.throw('Encore.enableForkedTypeScriptTypesChecking() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        });
    });

    describe('enableBabelTypeScriptPreset', function() {
        it('TypeScript can not be compiled by Babel if ts-loader is already enabled (with typescript-loader)', function() {
            const config = createConfig();
            config.enableTypeScriptLoader();

            expect(function() {
                config.enableBabelTypeScriptPreset();
            }).to.throw('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableTypeScriptLoader() has been called.');
        });

        it('TypeScript can not be compiled by Babel if ts-loader is already enabled (with forked typescript types checking)', function() {
            const config = createConfig();
            config.enableForkedTypeScriptTypesChecking();

            expect(function() {
                config.enableBabelTypeScriptPreset();
            }).to.throw('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableForkedTypeScriptTypesChecking() has been called.');
        });

        it('Options should be defined', function() {
            const config = createConfig();
            const options = { isTSX: true };

            config.enableBabelTypeScriptPreset(options);

            expect(config.babelTypeScriptPresetOptions).to.equal(options);
        });
    });

    describe('enableVueLoader', function() {
        it('Call with no config', function() {
            const config = createConfig();
            config.enableVueLoader();

            expect(config.useVueLoader).to.be.true;
        });

        it('Pass config', function() {
            const config = createConfig();
            const callback = (options) => {
                options.preLoaders = { foo: 'foo-loader' };
            };
            config.enableVueLoader(callback);

            expect(config.useVueLoader).to.be.true;
            expect(config.vueLoaderOptionsCallback).to.equal(callback);
        });

        it('Should validate Encore-specific options', function() {
            const config = createConfig();

            expect(() => {
                config.enableVueLoader(() => {}, {
                    notExisting: false,
                });
            }).to.throw('"notExisting" is not a valid key for enableVueLoader(). Valid keys: useJsx, version, runtimeCompilerBuild.');
        });

        it('Should set Encore-specific options', function() {
            const config = createConfig();
            config.enableVueLoader(() => {}, {
                useJsx: true,
            });

            expect(config.vueOptions).to.deep.equal({
                runtimeCompilerBuild: null,
                useJsx: true,
                version: null,
            });
        });

        it('Should validate Vue version', function() {
            const config = createConfig();

            expect(() => {
                config.enableVueLoader(() => {}, {
                    version: 4,
                });
            }).to.throw('"4" is not a valid value for the "version" option passed to enableVueLoader(). Valid versions are: 2, 3.');
        });
    });


    describe('enableBuildNotifications', function() {
        it('Calling method with default values', function() {
            const config = createConfig();
            config.enableBuildNotifications();

            expect(config.useWebpackNotifier).to.be.true;
        });

        it('Calling method without enabling it', function() {
            const config = createConfig();
            config.enableBuildNotifications(false);

            expect(config.useWebpackNotifier).to.be.false;
        });

        it('Calling method with options callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.enableBuildNotifications(true, callback);

            expect(config.useWebpackNotifier).to.be.true;
            expect(config.notifierPluginOptionsCallback).to.equal(callback);
        });

        it('Calling method with invalid options callback', function() {
            const config = createConfig();

            expect(() => config.enableBuildNotifications(true, 'FOO')).to.throw('must be a callback function');
        });
    });

    describe('enableHandlebarsLoader', function() {

        it('Call with no config', function() {
            const config = createConfig();
            config.enableHandlebarsLoader();

            expect(config.useHandlebarsLoader).to.be.true;
        });

        it('Pass config', function() {
            const config = createConfig();
            const callback = (options) => {
                options.debug = true;
            };
            config.enableHandlebarsLoader(callback);

            expect(config.useHandlebarsLoader).to.be.true;
            expect(config.handlebarsConfigurationCallback).to.equal(callback);
        });

    });

    describe('addPlugin', function() {
        it('extends the current registered plugins', function() {
            const config = createConfig();
            const nbOfPlugins = config.plugins.length;

            expect(nbOfPlugins).to.equal(0);

            config.addPlugin(new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/
            }));

            expect(config.plugins.length).to.equal(1);
            expect(config.plugins[0].plugin).to.be.instanceof(webpack.IgnorePlugin);
            expect(config.plugins[0].priority).to.equal(0);
        });

        it('Calling it with a priority', function() {
            const config = createConfig();
            const nbOfPlugins = config.plugins.length;

            expect(nbOfPlugins).to.equal(0);

            config.addPlugin(new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/
            }), 10);

            expect(config.plugins.length).to.equal(1);
            expect(config.plugins[0].plugin).to.be.instanceof(webpack.IgnorePlugin);
            expect(config.plugins[0].priority).to.equal(10);
        });

        it('Calling it with an invalid priority', function() {
            const config = createConfig();
            const nbOfPlugins = config.plugins.length;

            expect(nbOfPlugins).to.equal(0);

            expect(() => {
                config.addPlugin(new webpack.IgnorePlugin({
                    resourceRegExp: /^\.\/locale$/,
                    contextRegExp: /moment$/
                }), 'foo');
            }).to.throw('must be a number');
        });
    });

    describe('addLoader', function() {
        it('Adds a new loader', function() {
            const config = createConfig();

            config.addLoader({ 'test': /\.custom$/, 'loader': 'custom-loader' });

            expect(config.loaders).to.deep.equals([{ 'test': /\.custom$/, 'loader': 'custom-loader' }]);
        });
    });

    describe('addAliases', function() {
        it('Adds new aliases', function() {
            const config = createConfig();

            expect(config.aliases).to.deep.equals({});

            config.addAliases({ 'testA': 'src/testA', 'testB': 'src/testB' });
            config.addAliases({ 'testC': 'src/testC' });

            expect(config.aliases).to.deep.equals({
                'testA': 'src/testA',
                'testB': 'src/testB',
                'testC': 'src/testC'
            });
        });

        it('Calling it with an invalid argument', function() {
            const config = createConfig();

            expect(() => {
                config.addAliases('foo');
            }).to.throw('must be an object');
        });
    });

    describe('addExternals', function() {
        it('Adds new externals', function() {
            const config = createConfig();

            expect(config.externals).to.deep.equals([]);

            config.addExternals({ 'jquery': 'jQuery', 'react': 'react', 'svelte': 'svelte' });
            config.addExternals({ 'lodash': 'lodash' });
            config.addExternals(/^(jquery|\$)$/i);

            expect(config.externals).to.deep.equals([
                { 'jquery': 'jQuery', 'react': 'react', 'svelte': 'svelte' },
                { 'lodash': 'lodash' },
                /^(jquery|\$)$/i
            ]);
        });
    });

    describe('disableCssExtraction', function() {
        it('By default the CSS extraction is enabled', function() {
            const config = createConfig();

            expect(config.extractCss).to.be.true;
        });

        it('Calling it with no params disables the CSS extraction', function() {
            const config = createConfig();
            config.disableCssExtraction();

            expect(config.extractCss).to.be.false;
        });

        it('Calling it with boolean set to true disables CSS extraction', function() {
            const config = createConfig();
            config.disableCssExtraction(true);

            expect(config.extractCss).to.be.false;
        });

        it('Calling it with boolean set to false enables CSS extraction', function() {
            const config = createConfig();
            config.disableCssExtraction(false);

            expect(config.extractCss).to.be.true;
        });

    });

    describe('configureFilenames', function() {
        it('Calling method sets it', function() {
            const config = createConfig();
            config.configureFilenames({
                js: '[name].[contenthash].js',
                css: '[name].[contenthash].css',
                assets: 'assets/[name].[hash:8][ext]',
            });

            expect(config.configuredFilenames).to.deep.equals({
                js: '[name].[contenthash].js',
                css: '[name].[contenthash].css',
                assets: 'assets/[name].[hash:8][ext]',
            });
        });

        it('Calling with non-object throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureFilenames('FOO');
            }).to.throw('must be an object');
        });

        it('Calling with an unknown key throws an error', function() {
            const config = createConfig();

            expect(() => {
                config.configureFilenames({
                    foo: 'bar'
                });
            }).to.throw('"foo" is not a valid key');
        });
    });

    describe('configureImageRule', function() {
        it('Calling method sets options and callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.configureImageRule({
                type: 'asset',
                maxSize: 1024,
            }, callback);

            expect(config.imageRuleOptions.maxSize).to.equals(1024);
            expect(config.imageRuleCallback).to.equals(callback);
        });

        it('Calling with invalid option throws error', function() {
            const config = createConfig();

            expect(() => {
                config.configureImageRule({ fake: true });
            }).to.throw('Invalid option "fake" passed');
        });

        it('Setting maxSize for type of not asset throws error', function() {
            const config = createConfig();

            expect(() => {
                config.configureImageRule({ type: 'asset/resource', maxSize: 1024 });
            }).to.throw('this option is only valid when "type" is set to "asset"');
        });

        it('Passing non callback to 2nd arg throws error', function() {
            const config = createConfig();

            expect(() => {
                config.configureImageRule({}, {});
            }).to.throw('Argument 2 to configureImageRule() must be a callback');
        });
    });

    describe('configureFontRule', function() {
        it('Calling method sets options and callback', function() {
            const config = createConfig();
            const callback = () => {};
            config.configureFontRule({
                type: 'asset',
                maxSize: 1024,
            }, callback);

            expect(config.fontRuleOptions.maxSize).to.equals(1024);
            expect(config.fontRuleCallback).to.equals(callback);
        });

        it('Calling with invalid option throws error', function() {
            const config = createConfig();

            expect(() => {
                config.configureFontRule({ fake: true });
            }).to.throw('Invalid option "fake" passed');
        });

        it('Setting maxSize for type of not asset throws error', function() {
            const config = createConfig();

            expect(() => {
                config.configureFontRule({ type: 'asset/resource', maxSize: 1024 });
            }).to.throw('this option is only valid when "type" is set to "asset"');
        });

        it('Passing non callback to 2nd arg throws error', function() {
            const config = createConfig();

            expect(() => {
                config.configureFontRule({}, {});
            }).to.throw('Argument 2 to configureFontRule() must be a callback');
        });
    });

    describe('configureWatchOptions()', function() {
        it('Pass config', function() {
            const config = createConfig();
            const callback = (watchOptions) => {
                watchOptions.poll = 250;
            };

            config.configureWatchOptions(callback);

            expect(config.watchOptionsConfigurationCallback).to.equal(callback);
        });

        it('Call method without a valid callback', function() {
            const config = createConfig();

            expect(() => {
                config.configureWatchOptions();
            }).to.throw('Argument 1 to configureWatchOptions() must be a callback function.');

            expect(() => {
                config.configureWatchOptions({});
            }).to.throw('Argument 1 to configureWatchOptions() must be a callback function.');
        });
    });

    describe('configureLoaderRule()', function() {
        it('works properly', function() {
            const config = createConfig();
            const callback = (loader) => {};

            expect(config.loaderConfigurationCallbacks['javascript']).to.not.equal(callback);

            config.configureLoaderRule('javascript', callback);
            expect(config.loaderConfigurationCallbacks['javascript']).to.equal(callback);
        });

        it('Call method with a not supported loader', function() {
            const config = createConfig();

            expect(() => {
                config.configureLoaderRule('reason');
            }).to.throw('Loader "reason" is not configurable. Valid loaders are "javascript", "css", "images", "fonts", "sass", "less", "stylus", "vue", "typescript", "handlebars", "svelte" and the aliases "js", "ts", "scss".');
        });

        it('Call method with not a valid callback', function() {
            const config = createConfig();

            expect(() => {
                config.configureLoaderRule('javascript');
            }).to.throw('Argument 2 to configureLoaderRule() must be a callback function.');

            expect(() => {
                config.configureLoaderRule('javascript', {});
            }).to.throw('Argument 2 to configureLoaderRule() must be a callback function.');
        });
    });

    describe('enableIntegrityHashes', function() {
        it('Calling it without any option', function() {
            const config = createConfig();
            config.enableIntegrityHashes();

            expect(config.integrityAlgorithms).to.deep.equal(['sha384']);
        });

        it('Calling it without false as a first argument disables it', function() {
            const config = createConfig();
            config.enableIntegrityHashes(false, 'sha1');

            expect(config.integrityAlgorithms).to.deep.equal([]);
        });

        it('Calling it with a single algorithm', function() {
            const config = createConfig();
            config.enableIntegrityHashes(true, 'sha1');

            expect(config.integrityAlgorithms).to.deep.equal(['sha1']);
        });

        it('Calling it with multiple algorithms', function() {
            const config = createConfig();
            config.enableIntegrityHashes(true, ['sha1', 'sha256', 'sha512']);

            expect(config.integrityAlgorithms).to.deep.equal(['sha1', 'sha256', 'sha512']);
        });

        it('Calling it with an invalid algorithm', function() {
            const config = createConfig();
            expect(() => config.enableIntegrityHashes(true, {})).to.throw('must be a string or an array of strings');
            expect(() => config.enableIntegrityHashes(true, [1])).to.throw('must be a string or an array of strings');
            expect(() => config.enableIntegrityHashes(true, 'foo')).to.throw('Invalid hash algorithm "foo"');
            expect(() => config.enableIntegrityHashes(true, ['sha1', 'foo', 'sha256'])).to.throw('Invalid hash algorithm "foo"');
        });
    });

    describe('validateNameIsNewEntry', function() {
        it('Providing a new name does not throw an error', function() {
            const config = createConfig();
            config.addEntry('entry_foo', './foo.js');

            expect(() => {
                config.validateNameIsNewEntry('unused_name');
            }).to.not.throw;
        });

        it('Providing a name exists within Entries does throw an error', function() {
            const config = createConfig();
            config.addEntry('entry_foo', './foo.js');

            expect(() => {
                config.validateNameIsNewEntry('entry_foo');
            }).to.throw('already exists as an Entrypoint');
        });

        it('Providing a name exists within Style Entries does throw an error', function() {
            const config = createConfig();
            config.addStyleEntry('entry_foo', './foo.js');

            expect(() => {
                config.validateNameIsNewEntry('entry_foo');
            }).to.throw('already exists as a Style Entrypoint');
        });
    });
});

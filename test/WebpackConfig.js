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

describe('WebpackConfig object', () => {

    describe('setOutputPath', () => {
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

        it('use absolute, existent path', () => {
            const config = createConfig();
            config.setOutputPath(__dirname);

            expect(config.outputPath).to.equal(__dirname);
        });

        it('relative path, becomes absolute', () => {
            const config = createConfig();
            config.setOutputPath('new_dir');

            // __dirname is the context
            expect(config.outputPath).to.equal(
                path.join(__dirname, '/new_dir')
            );
        });

        it('non-existent path creates directory', () => {
            const targetPath = path.join(__dirname, 'new_dir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            config.setOutputPath(targetPath);
            expect(fs.existsSync(config.outputPath)).to.be.true;
        });

        it('non-existent directory, 3 levels deep is created correctly', () => {
            var targetPath = path.join(__dirname, 'new_dir', 'subdir1', 'subdir2');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            config.setOutputPath(targetPath);
            expect(fs.existsSync(config.outputPath)).to.be.true;
        });

        it('non-existent path outside of the context directory works if only one directory has to be created', () => {
            var targetPath = path.join(__dirname, '..', 'new_dir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            config.setOutputPath(targetPath);
            expect(fs.existsSync(config.outputPath)).to.be.true;
        });

        it('non-existent path outside of the context directory throws an error if more than one directory has to be created', () => {
            var targetPath = path.join(__dirname, '..', 'new_dir', 'subdir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            expect(() => config.setOutputPath(targetPath)).to.throw('create this directory');
        });
    });

    describe('setPublicPath', () => {
        it('/foo => /foo/', () => {
            const config = createConfig();
            config.setPublicPath('/foo');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('/foo/ => /foo/', () => {
            const config = createConfig();
            config.setPublicPath('/foo/');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('https://example.com => https://example.com/', () => {
            const config = createConfig();
            config.setPublicPath('https://example.com');

            expect(config.publicPath).to.equal('https://example.com/');
        });

        it('You can omit the opening slash, but get a warning', () => {
            const config = createConfig();
            config.setPublicPath('foo');

            expect(logger.getMessages().warning).to.have.lengthOf(1);
        });
    });

    describe('getRealPublicPath', () => {
        it('Returns normal with no dev server', () => {
            const config = createConfig();
            config.setPublicPath('/public');

            expect(config.getRealPublicPath()).to.equal('/public/');
        });

        it('Prefix when using devServer', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerUrl = 'http://localhost:8080/';
            config.setPublicPath('/public');

            expect(config.getRealPublicPath()).to.equal('http://localhost:8080/public/');
        });

        it('No prefix with devServer & devServerKeepPublicPath option', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerUrl = 'http://localhost:8080/';
            config.runtimeConfig.devServerKeepPublicPath = true;
            config.setPublicPath('/public');

            expect(config.getRealPublicPath()).to.equal('/public/');
        });

        it('devServer does not prefix if publicPath is absolute', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.runtimeConfig.devServerUrl = 'http://localhost:8080/';
            config.setPublicPath('http://coolcdn.com/public');
            config.setManifestKeyPrefix('/public/');

            expect(config.getRealPublicPath()).to.equal('http://coolcdn.com/public/');
        });
    });

    describe('setManifestKeyPrefix', () => {

        it('You can set it!', () => {
            const config = createConfig();
            config.setManifestKeyPrefix('foo');

            // trailing slash added
            expect(config.manifestKeyPrefix).to.equal('foo/');
        });

        it('You can set it blank', () => {
            const config = createConfig();
            config.setManifestKeyPrefix('');

            // trailing slash not added
            expect(config.manifestKeyPrefix).to.equal('');
        });

        it('You can use an opening slash, but get a warning', () => {
            const config = createConfig();

            logger.reset();
            logger.quiet();
            config.setManifestKeyPrefix('/foo/');
            expect(logger.getMessages().warning).to.have.lengthOf(1);
        });
    });

    describe('cleanupOutputBeforeBuild', () => {
        it('Enabling it with default settings', () => {
            const config = createConfig();
            config.cleanupOutputBeforeBuild();

            expect(config.cleanupOutput).to.be.true;
            expect(config.cleanWebpackPluginPaths).to.deep.equal(['**/*']);
        });

        it('Setting paths and callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.cleanupOutputBeforeBuild(['**/*.js', '**/*.css'], callback);

            expect(config.cleanupOutput).to.be.true;
            expect(config.cleanWebpackPluginPaths).to.deep.equal(['**/*.js', '**/*.css']);
            expect(config.cleanWebpackPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid paths argument', () => {
            const config = createConfig();

            expect(() => {
                config.cleanupOutputBeforeBuild('foo', () => {});
            }).to.throw('Argument 1 to cleanupOutputBeforeBuild() must be an Array of paths');
        });

        it('Setting invalid callback argument', () => {
            const config = createConfig();

            expect(() => {
                config.cleanupOutputBeforeBuild(['**/*'], 'foo');
            }).to.throw('Argument 2 to cleanupOutputBeforeBuild() must be a callback function');
        });
    });

    describe('configureDefinePlugin', () => {
        it('Setting callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.configureDefinePlugin(callback);

            expect(config.definePluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', () => {
            const config = createConfig();

            expect(() => {
                config.configureDefinePlugin('foo');
            }).to.throw('Argument 1 to configureDefinePlugin() must be a callback function');
        });
    });

    describe('configureFriendlyErrorsPlugin', () => {
        it('Setting callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.configureFriendlyErrorsPlugin(callback);

            expect(config.friendlyErrorsPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', () => {
            const config = createConfig();

            expect(() => {
                config.configureFriendlyErrorsPlugin('foo');
            }).to.throw('Argument 1 to configureFriendlyErrorsPlugin() must be a callback function');
        });
    });

    describe('configureManifestPlugin', () => {
        it('Setting callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.configureManifestPlugin(callback);

            expect(config.manifestPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', () => {
            const config = createConfig();
            const callback = 'invalid';

            expect(() => {
                config.configureManifestPlugin(callback);
            }).to.throw('Argument 1 to configureManifestPlugin() must be a callback function');
        });
    });

    describe('configureTerserPlugin', () => {
        it('Setting callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.configureTerserPlugin(callback);

            expect(config.terserPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', () => {
            const config = createConfig();

            expect(() => {
                config.configureTerserPlugin('foo');
            }).to.throw('Argument 1 to configureTerserPlugin() must be a callback function');
        });
    });

    describe('configureOptimizeCssPlugin', () => {
        it('Setting callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.configureOptimizeCssPlugin(callback);

            expect(config.optimizeCssPluginOptionsCallback).to.equal(callback);
        });

        it('Setting invalid callback argument', () => {
            const config = createConfig();

            expect(() => {
                config.configureOptimizeCssPlugin('foo');
            }).to.throw('Argument 1 to configureOptimizeCssPlugin() must be a callback function');
        });
    });

    describe('addEntry', () => {
        it('Calling with a duplicate name throws an error', () => {
            const config = createConfig();
            config.addEntry('entry_foo', './foo.js');

            expect(() => {
                config.addEntry('entry_foo', './bar.js');
            }).to.throw('Duplicate name');
        });

        it('Calling with a duplicate of addStyleEntry', () => {
            const config = createConfig();
            config.addStyleEntry('main', './main.scss');

            expect(() => {
                config.addEntry('main', './main.js');
            }).to.throw('conflicts with a name passed to addStyleEntry');
        });
    });

    describe('addStyleEntry', () => {
        it('Calling with a duplicate name throws an error', () => {
            const config = createConfig();
            config.addStyleEntry('entry_foo', './foo.css');

            expect(() => {
                config.addStyleEntry('entry_foo', './bar.css');
            }).to.throw('Duplicate name');
        });

        it('Calling with a duplicate of addEntry', () => {
            const config = createConfig();
            config.addEntry('main', './main.scss');

            expect(() => {
                config.addStyleEntry('main', './main.js');
            }).to.throw('conflicts with a name passed to addEntry');
        });
    });

    describe('createSharedEntry', () => {
        it('Calling twice throws an error', () => {
            const config = createConfig();
            config.createSharedEntry('vendor', 'jquery');

            expect(() => {
                config.createSharedEntry('vendor2', './main');
            }).to.throw('cannot be called multiple');
        });

        it('Calling with splitEntryChunks() is not supported', () => {
            const config = createConfig();
            config.splitEntryChunks();

            expect(() => {
                config.createSharedEntry('vendor', './main');
            }).to.throw('together is not supported');
        });
    });

    describe('addCacheGroup', () => {
        it('Calling it adds cache groups', () => {
            const config = createConfig();
            config.addCacheGroup('foo', { test: /foo/ });
            config.addCacheGroup('bar', { test: /bar/ });

            expect(config.cacheGroups).to.deep.equal({
                foo: { test: /foo/ },
                bar: { test: /bar/ },
            });
        });

        it('Calling it using the "node_modules" option', () => {
            const config = createConfig();
            config.addCacheGroup('foo', { node_modules: ['foo','bar', 'baz'] });

            expect(config.cacheGroups).to.deep.equal({
                foo: {
                    test: /[\\/]node_modules[\\/](foo|bar|baz)[\\/]/,
                },
            });
        });

        it('Calling it with other SplitChunksPlugin options', () => {
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

        it('Calling it with an invalid name', () => {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup(true, { test: /foo/ });
            }).to.throw('must be a string');
        });

        it('Calling it with an invalid options parameter', () => {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup('foo', 'bar');
            }).to.throw('must be an object');
        });

        it('Calling it with an invalid node_modules option', () => {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup('foo', {
                    'node_modules': 'foo'
                });
            }).to.throw('must be an array');
        });

        it('Calling it without the "test" or "node_modules" option', () => {
            const config = createConfig();
            expect(() => {
                config.addCacheGroup('foo', { type: 'json' });
            }).to.throw('Either the "test" option or the "node_modules" option');
        });
    });

    describe('copyFiles', () => {
        it('Calling it adds files to be copied', () => {
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

        it('Calling it with an invalid parameter', () => {
            const config = createConfig();

            expect(() => {
                config.copyFiles('foo');
            }).to.throw('must be called with either a config object or an array of config objects');

            expect(() => {
                config.copyFiles([{ from: 'foo' }, 'foo']);
            }).to.throw('must be called with either a config object or an array of config objects');
        });

        it('Calling it with a missing from key', () => {
            const config = createConfig();

            expect(() => {
                config.copyFiles({ to: 'foo' });
            }).to.throw('must have a "from" property');

            expect(() => {
                config.copyFiles([{ from: 'foo' }, { to: 'foo' }]);
            }).to.throw('must have a "from" property');
        });

        it('Calling it with an unknown config property', () => {
            const config = createConfig();

            expect(() => {
                config.copyFiles({ from: 'images', foo: 'foo' });
            }).to.throw('Invalid config option "foo"');
        });

        it('Calling it with an invalid "pattern" option', () => {
            const config = createConfig();

            expect(() => {
                config.copyFiles({ from: 'images', pattern: true });
            }).to.throw('Invalid pattern "true"');

            expect(() => {
                config.copyFiles({ from: 'images', pattern: 'foo' });
            }).to.throw('Invalid pattern "foo"');
        });
    });

    describe('autoProvideVariables', () => {
        it('Calling multiple times merges', () => {
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

        it('Calling with string throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.autoProvideVariables('jquery');
            }).to.throw('must pass an object');
        });

        it('Calling with an Array throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.autoProvideVariables(['jquery']);
            }).to.throw('must pass an object');
        });
    });

    describe('configureBabel', () => {
        beforeEach(() => {
            logger.reset();
            logger.quiet();
        });

        afterEach(() => {
            logger.quiet(false);
        });

        it('Calling method sets it', () => {
            const config = createConfig();
            const testCallback = () => {};
            config.configureBabel(testCallback);
            expect(config.babelConfigurationCallback).to.equal(testCallback);
            expect(String(config.babelOptions.exclude)).to.equal(String(/(node_modules|bower_components)/));
        });

        it('Calling with "exclude" option', () => {
            const config = createConfig();
            config.configureBabel(() => {}, { exclude: 'foo' });

            expect(config.babelOptions.exclude).to.equal('foo');
        });

        it('Calling with "includeNodeModules" option', () => {
            const config = createConfig();
            config.configureBabel(() => {}, { include_node_modules: ['foo', 'bar'] });

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

        it('Calling with "useBuiltIns" option', () => {
            const config = createConfig();
            config.configureBabel(() => { }, { useBuiltIns: 'foo' });

            expect(config.babelOptions.useBuiltIns).to.equal('foo');
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureBabel('FOO');
            }).to.throw('must be a callback function');
        });

        it('Calling with a callback when .babelrc is present displays a warning', () => {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;
            config.configureBabel(() => {});

            const warnings = logger.getMessages().warning;
            expect(warnings).to.have.lengthOf(1);
            expect(warnings[0]).to.contain('your app already provides an external Babel configuration');
        });

        it('Calling with a whitelisted option when .babelrc is present works fine', () => {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;
            config.configureBabel(null, { includeNodeModules: ['foo'] });
            expect(logger.getMessages().warning).to.be.empty;
        });

        it('Calling with a non-whitelisted option when .babelrc is present displays a warning', () => {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;
            config.configureBabel(null, { useBuiltIns: 'foo' });

            const warnings = logger.getMessages().warning;
            expect(warnings).to.have.lengthOf(1);
            expect(warnings[0]).to.contain('your app already provides an external Babel configuration');
        });

        it('Pass invalid config', () => {
            const config = createConfig();

            expect(() => {
                config.configureBabel(() => {}, { fake_option: 'foo' });
            }).to.throw('Invalid option "fake_option" passed to configureBabel()');
        });

        it('Calling with both "includeNodeModules" and "exclude" options', () => {
            const config = createConfig();

            expect(() => {
                config.configureBabel(() => {}, { exclude: 'foo', includeNodeModules: ['bar', 'baz'] });
            }).to.throw('can\'t be used together');
        });

        it('Calling with an invalid "includeNodeModules" option value', () => {
            const config = createConfig();

            expect(() => {
                config.configureBabel(() => {}, { includeNodeModules: 'foo' });
            }).to.throw('must be an Array');
        });
    });

    describe('configureBabelPresetEnv', () => {
        beforeEach(() => {
            logger.reset();
            logger.quiet();
        });

        afterEach(() => {
            logger.quiet(false);
        });

        it('Calling method sets it', () => {
            const config = createConfig();
            const testCallback = () => {};
            config.configureBabelPresetEnv(testCallback);
            expect(config.babelPresetEnvOptionsCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureBabelPresetEnv('FOO');
            }).to.throw('must be a callback function');
        });

        it('Calling with a callback when .babelrc is present throws an error', () => {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;

            expect(() => {
                config.configureBabelPresetEnv(() => {});
            }).to.throw('your app already provides an external Babel configuration');
        });
    });

    describe('configureCssLoader', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            const testCallback = () => {};
            config.configureCssLoader(testCallback);
            expect(config.cssLoaderConfigurationCallback).to.equal(testCallback);

        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureCssLoader('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('configureSplitChunks', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            const testCallback = () => {};
            config.configureSplitChunks(testCallback);
            expect(config.splitChunksConfigurationCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureSplitChunks('FOO');
            }).to.throw('must be a callback function');
        });

        it('Calling with createdSharedEntry() is not supported', () => {
            const config = createConfig();
            config.createSharedEntry('vendor', './main');

            expect(() => {
                config.splitEntryChunks();
            }).to.throw('together is not supported');
        });
    });

    describe('enablePostCssLoader', () => {
        it('Call with no config', () => {
            const config = createConfig();
            config.enablePostCssLoader();

            expect(config.usePostCssLoader).to.be.true;
        });

        it('Pass options callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.enablePostCssLoader(callback);

            expect(config.usePostCssLoader).to.be.true;
            expect(config.postCssLoaderOptionsCallback).to.equal(callback);
        });

        it('Pass invalid options callback', () => {
            const config = createConfig();

            expect(() => config.enablePostCssLoader('FOO')).to.throw('must be a callback function');
        });
    });

    describe('enableSassLoader', () => {
        it('Call with no config', () => {
            const config = createConfig();
            config.enableSassLoader();

            expect(config.useSassLoader).to.be.true;
        });

        it('Pass valid config', () => {
            const config = createConfig();
            config.enableSassLoader(() => {}, { resolveUrlLoader: false });

            expect(config.useSassLoader).to.be.true;
            expect(config.sassOptions.resolveUrlLoader).to.be.false;
        });

        it('Pass invalid config', () => {
            const config = createConfig();

            expect(() => {
                config.enableSassLoader(() => {}, { fake_option: false });
            }).to.throw('Invalid option "fake_option" passed to enableSassLoader()');
        });

        it('Pass options callback', () => {
            const config = createConfig();
            const callback = (sassOptions) => {};
            config.enableSassLoader(callback);

            expect(config.sassLoaderOptionsCallback).to.equal(callback);
        });
    });

    describe('enableLessLoader', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            config.enableLessLoader();

            expect(config.useLessLoader).to.be.true;
        });

        it('Calling with callback', () => {
            const config = createConfig();
            const callback = (lessOptions) => {};
            config.enableLessLoader(callback);

            expect(config.lessLoaderOptionsCallback).to.equal(callback);
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.enableLessLoader('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('enableStylusLoader', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            config.enableStylusLoader();

            expect(config.useStylusLoader).to.be.true;
        });

        it('Calling with callback', () => {
            const config = createConfig();
            const callback = (stylusOptions) => {};
            config.enableStylusLoader(callback);

            expect(config.stylusLoaderOptionsCallback).to.equal(callback);
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.enableStylusLoader('FOO');
            }).to.throw('must be a callback function');
        });
    });

    describe('enablePreactPreset', () => {
        it('Without preact-compat', () => {
            const config = createConfig();
            config.enablePreactPreset();

            expect(config.usePreact).to.be.true;
            expect(config.preactOptions.preactCompat).to.be.false;
        });

        it('With preact-compat', () => {
            const config = createConfig();
            config.enablePreactPreset({
                preactCompat: true
            });

            expect(config.usePreact).to.be.true;
            expect(config.preactOptions.preactCompat).to.be.true;
        });

        it('With an invalid option', () => {
            const config = createConfig();
            expect(() => {
                config.enablePreactPreset({
                    foo: true
                });
            }).to.throw('Invalid option "foo"');
        });
    });

    describe('enableTypeScriptLoader', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            const testCallback = () => {};
            config.enableTypeScriptLoader(testCallback);
            expect(config.tsConfigurationCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.enableTypeScriptLoader('FOO');
            }).to.throw('must be a callback function');
        });

        it('TypeScript can not be compiled by ts-loader if Babel is already handling TypeScript', () => {
            const config = createConfig();
            config.enableBabelTypeScriptPreset();

            expect(function() {
                config.enableTypeScriptLoader();
            }).to.throw('Encore.enableTypeScriptLoader() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        });
    });

    describe('enableForkedTypeScriptTypesChecking', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            config.enableTypeScriptLoader();
            const testCallback = () => {};
            config.enableForkedTypeScriptTypesChecking(testCallback);
            expect(config.forkedTypeScriptTypesCheckOptionsCallback)
                .to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.enableForkedTypeScriptTypesChecking('FOO');
            }).to.throw('must be a callback function');
        });

        it('TypeScript can not be compiled by Babel if forked types checking is enabled', () => {
            const config = createConfig();
            config.enableBabelTypeScriptPreset();

            expect(function() {
                config.enableForkedTypeScriptTypesChecking();
            }).to.throw('Encore.enableForkedTypeScriptTypesChecking() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        });
    });

    describe('enableBabelTypeScriptPreset', () => {
        it('TypeScript can not be compiled by Babel if ts-loader is already enabled', () => {
            const config = createConfig();
            config.enableTypeScriptLoader();

            expect(function() {
                config.enableBabelTypeScriptPreset();
            }).to.throw('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableTypeScriptLoader() has been called.');
        });

        it('TypeScript can not be compiled by Babel if ts-loader is already enabled', () => {
            const config = createConfig();
            config.enableForkedTypeScriptTypesChecking();

            expect(function() {
                config.enableBabelTypeScriptPreset();
            }).to.throw('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableForkedTypeScriptTypesChecking() has been called.');
        });

        it('Options should be defined', () => {
            const config = createConfig();
            const options = { isTSX: true };

            config.enableBabelTypeScriptPreset(options);

            expect(config.babelTypeScriptPresetOptions).to.equal(options);
        });
    });

    describe('enableVueLoader', () => {
        it('Call with no config', () => {
            const config = createConfig();
            config.enableVueLoader();

            expect(config.useVueLoader).to.be.true;
        });

        it('Pass config', () => {
            const config = createConfig();
            const callback = (options) => {
                options.preLoaders = { foo: 'foo-loader' };
            };
            config.enableVueLoader(callback);

            expect(config.useVueLoader).to.be.true;
            expect(config.vueLoaderOptionsCallback).to.equal(callback);
        });

        it('Should validate Encore-specific options', () => {
            const config = createConfig();

            expect(() => {
                config.enableVueLoader(() => {}, {
                    notExisting: false,
                });
            }).to.throw('"notExisting" is not a valid key for enableVueLoader(). Valid keys: useJsx, version.');
        });

        it('Should set Encore-specific options', () => {
            const config = createConfig();
            config.enableVueLoader(() => {}, {
                useJsx: true,
            });

            expect(config.vueOptions).to.deep.equal({
                useJsx: true,
                version: null,
            });
        });

        it('Should validate Vue version', () => {
            const config = createConfig();

            expect(() => {
                config.enableVueLoader(() => {}, {
                    version: 4,
                });
            }).to.throw('"4" is not a valid value for the "version" option passed to enableVueLoader(). Valid versions are: 2, 3.');
        });
    });


    describe('enableBuildNotifications', () => {
        it('Calling method with default values', () => {
            const config = createConfig();
            config.enableBuildNotifications();

            expect(config.useWebpackNotifier).to.be.true;
        });

        it('Calling method without enabling it', () => {
            const config = createConfig();
            config.enableBuildNotifications(false);

            expect(config.useWebpackNotifier).to.be.false;
        });

        it('Calling method with options callback', () => {
            const config = createConfig();
            const callback = () => {};
            config.enableBuildNotifications(true, callback);

            expect(config.useWebpackNotifier).to.be.true;
            expect(config.notifierPluginOptionsCallback).to.equal(callback);
        });

        it('Calling method with invalid options callback', () => {
            const config = createConfig();

            expect(() => config.enableBuildNotifications(true, 'FOO')).to.throw('must be a callback function');
        });
    });

    describe('enableHandlebarsLoader', () => {

        it('Call with no config', () => {
            const config = createConfig();
            config.enableHandlebarsLoader();

            expect(config.useHandlebarsLoader).to.be.true;
        });

        it('Pass config', () => {
            const config = createConfig();
            const callback = (options) => {
                options.debug = true;
            };
            config.enableHandlebarsLoader(callback);

            expect(config.useHandlebarsLoader).to.be.true;
            expect(config.handlebarsConfigurationCallback).to.equal(callback);
        });

    });

    describe('addPlugin', () => {
        it('extends the current registered plugins', () => {
            const config = createConfig();
            const nbOfPlugins = config.plugins.length;

            expect(nbOfPlugins).to.equal(0);

            config.addPlugin(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));

            expect(config.plugins.length).to.equal(1);
            expect(config.plugins[0].plugin).to.be.instanceof(webpack.IgnorePlugin);
            expect(config.plugins[0].priority).to.equal(0);
        });

        it('Calling it with a priority', () => {
            const config = createConfig();
            const nbOfPlugins = config.plugins.length;

            expect(nbOfPlugins).to.equal(0);

            config.addPlugin(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), 10);

            expect(config.plugins.length).to.equal(1);
            expect(config.plugins[0].plugin).to.be.instanceof(webpack.IgnorePlugin);
            expect(config.plugins[0].priority).to.equal(10);
        });

        it('Calling it with an invalid priority', () => {
            const config = createConfig();
            const nbOfPlugins = config.plugins.length;

            expect(nbOfPlugins).to.equal(0);

            expect(() => {
                config.addPlugin(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), 'foo');
            }).to.throw('must be a number');
        });
    });

    describe('addLoader', () => {
        it('Adds a new loader', () => {
            const config = createConfig();

            config.addLoader({ 'test': /\.custom$/, 'loader': 'custom-loader' });

            expect(config.loaders).to.deep.equals([{ 'test': /\.custom$/, 'loader': 'custom-loader' }]);
        });
    });

    describe('addAliases', () => {
        it('Adds new aliases', () => {
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

        it('Calling it with an invalid argument', () => {
            const config = createConfig();

            expect(() => {
                config.addAliases('foo');
            }).to.throw('must be an object');
        });
    });

    describe('addExternals', () => {
        it('Adds new externals', () => {
            const config = createConfig();

            expect(config.externals).to.deep.equals([]);

            config.addExternals({ 'jquery': 'jQuery', 'react': 'react' });
            config.addExternals({ 'lodash': 'lodash' });
            config.addExternals(/^(jquery|\$)$/i);

            expect(config.externals).to.deep.equals([
                { 'jquery': 'jQuery', 'react': 'react' },
                { 'lodash': 'lodash' },
                /^(jquery|\$)$/i
            ]);
        });
    });

    describe('disableImagesLoader', () => {
        it('Disable default images loader', () => {
            const config = createConfig();
            config.disableImagesLoader();

            expect(config.useImagesLoader).to.be.false;
        });
    });

    describe('disableFontsLoader', () => {
        it('Disable default fonts loader', () => {
            const config = createConfig();
            config.disableFontsLoader();

            expect(config.useFontsLoader).to.be.false;
        });
    });

    describe('disableCssExtraction', () => {
        it('By default the CSS extraction is enabled', () => {
            const config = createConfig();

            expect(config.extractCss).to.be.true;
        });

        it('Calling it disables the CSS extraction', () => {
            const config = createConfig();
            config.disableCssExtraction();

            expect(config.extractCss).to.be.false;
        });
    });

    describe('configureFilenames', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            config.configureFilenames({
                js: '[name].[contenthash].js',
                css: '[name].[contenthash].css',
                images: 'images/[name].[hash:8].[ext]',
                fonts: 'fonts/[name].[hash:8].[ext]'
            });

            expect(config.configuredFilenames).to.deep.equals({
                js: '[name].[contenthash].js',
                css: '[name].[contenthash].css',
                images: 'images/[name].[hash:8].[ext]',
                fonts: 'fonts/[name].[hash:8].[ext]'
            });
        });

        it('Calling with non-object throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureFilenames('FOO');
            }).to.throw('must be an object');
        });

        it('Calling with an unknown key throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureFilenames({
                    foo: 'bar'
                });
            }).to.throw('"foo" is not a valid key');
        });
    });

    describe('configureUrlLoader', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            config.configureUrlLoader({
                images: { limit: 8192 },
                fonts: { limit: 4096 }
            });

            expect(config.urlLoaderOptions).to.deep.equals({
                images: { limit: 8192 },
                fonts: { limit: 4096 }
            });
        });

        it('Calling with non-object throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureUrlLoader('FOO');
            }).to.throw('must be an object');
        });

        it('Calling with an unknown key throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureUrlLoader({
                    foo: 'bar'
                });
            }).to.throw('"foo" is not a valid key');
        });
    });

    describe('configureWatchOptions()', () => {
        it('Pass config', () => {
            const config = createConfig();
            const callback = (watchOptions) => {
                watchOptions.poll = 250;
            };

            config.configureWatchOptions(callback);

            expect(config.watchOptionsConfigurationCallback).to.equal(callback);
        });

        it('Call method without a valid callback', () => {
            const config = createConfig();

            expect(() => {
                config.configureWatchOptions();
            }).to.throw('Argument 1 to configureWatchOptions() must be a callback function.');

            expect(() => {
                config.configureWatchOptions({});
            }).to.throw('Argument 1 to configureWatchOptions() must be a callback function.');
        });
    });

    describe('configureLoaderRule()', () => {
        it('works properly', () => {
            const config = createConfig();
            const callback = (loader) => {};

            expect(config.loaderConfigurationCallbacks['eslint']).to.not.equal(callback);

            config.configureLoaderRule('eslint', callback);
            expect(config.loaderConfigurationCallbacks['eslint']).to.equal(callback);
        });

        it('Call method with a not supported loader', () => {
            const config = createConfig();

            expect(() => {
                config.configureLoaderRule('reason');
            }).to.throw('Loader "reason" is not configurable. Valid loaders are "javascript", "css", "images", "fonts", "sass", "less", "stylus", "vue", "eslint", "typescript", "handlebars" and the aliases "js", "ts", "scss".');
        });

        it('Call method with not a valid callback', () => {
            const config = createConfig();

            expect(() => {
                config.configureLoaderRule('eslint');
            }).to.throw('Argument 2 to configureLoaderRule() must be a callback function.');

            expect(() => {
                config.configureLoaderRule('eslint', {});
            }).to.throw('Argument 2 to configureLoaderRule() must be a callback function.');
        });
    });

    describe('enableIntegrityHashes', () => {
        it('Calling it without any option', () => {
            const config = createConfig();
            config.enableIntegrityHashes();

            expect(config.integrityAlgorithms).to.deep.equal(['sha384']);
        });

        it('Calling it without false as a first argument disables it', () => {
            const config = createConfig();
            config.enableIntegrityHashes(false, 'sha1');

            expect(config.integrityAlgorithms).to.deep.equal([]);
        });

        it('Calling it with a single algorithm', () => {
            const config = createConfig();
            config.enableIntegrityHashes(true, 'sha1');

            expect(config.integrityAlgorithms).to.deep.equal(['sha1']);
        });

        it('Calling it with multiple algorithms', () => {
            const config = createConfig();
            config.enableIntegrityHashes(true, ['sha1', 'sha256', 'sha512']);

            expect(config.integrityAlgorithms).to.deep.equal(['sha1', 'sha256', 'sha512']);
        });

        it('Calling it with an invalid algorithm', () => {
            const config = createConfig();
            expect(() => config.enableIntegrityHashes(true, {})).to.throw('must be a string or an array of strings');
            expect(() => config.enableIntegrityHashes(true, [1])).to.throw('must be a string or an array of strings');
            expect(() => config.enableIntegrityHashes(true, 'foo')).to.throw('Invalid hash algorithm "foo"');
            expect(() => config.enableIntegrityHashes(true, ['sha1', 'foo', 'sha256'])).to.throw('Invalid hash algorithm "foo"');
        });
    });

    describe('enableEslintLoader', () => {
        it('Should validate Encore-specific options', () => {
            const config = createConfig();

            expect(() => {
                config.enableEslintLoader(() => {}, {
                    notExisting: false,
                });
            }).to.throw('"notExisting" is not a valid key for enableEslintLoader(). Valid keys: lintVue.');
        });
    });
});

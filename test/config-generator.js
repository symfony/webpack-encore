const expect = require('chai').expect;
const WebpackConfig = require('../lib/WebpackConfig');
const configGenerator = require('../lib/config-generator');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('./../lib/webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

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
        if (rule.test.toString() == regex.toString()) {
            return rule;
        }
    }

    throw new Error(`No rule found for regex ${regex}`);
}

describe('The config-generator function', () => {

    describe('Test basic output properties', () => {
        it('Returns an object with the correct properties', () => {
            var config = new WebpackConfig();
            // setting explicitly to make test more dependable
            config.context = '/foo/dir';
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
            var config = new WebpackConfig();
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
            var config = new WebpackConfig();

            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path/';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.output)).to.equal(JSON.stringify({
                path: '/tmp/public-path',
                filename: '[name].js',
                publicPath: '/public-path/'
            }));
        });
    });

    describe('Test source maps changes', () => {
        it('without sourcemaps', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useSourceMaps = false;

            const actualConfig = configGenerator(config);
            expect(actualConfig.devtool).to.be.undefined;

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('?sourceMap')
        });

        it('with sourcemaps', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useSourceMaps = true;

            const actualConfig = configGenerator(config);
            expect(actualConfig.devtool).to.equal('#inline-source-map');

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('?sourceMap')
        });
    });

    describe('Test publicPath and manifestKeyPrefix variants', () => {
        it('with normal publicPath, manifestKeyPrefix matches it', () => {
            var config = new WebpackConfig();
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
            var config = new WebpackConfig();
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
            var config = new WebpackConfig();
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
            var config = new WebpackConfig();
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
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.environment = 'dev';
            config.enableVersioning(true);

            const actualConfig = configGenerator(config);

            const loaderOptionsPlugin = findPlugin(webpack.LoaderOptionsPlugin, actualConfig.plugins);
            expect(loaderOptionsPlugin.options.minimize).to.equal(false);
            expect(loaderOptionsPlugin.options.debug).to.equal(true);
            expect(loaderOptionsPlugin.options.options.context).to.equal('/tmp/context');
            expect(loaderOptionsPlugin.options.options.output.path).to.equal('/tmp/output/public-path');

            const moduleNamePlugin = findPlugin(webpack.NamedModulesPlugin, actualConfig.plugins);
            expect(moduleNamePlugin).to.not.be.undefined;
        });

        it('YES to production', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.environment = 'production';
            config.enableVersioning(true);

            const actualConfig = configGenerator(config);

            const loaderOptionsPlugin = findPlugin(webpack.LoaderOptionsPlugin, actualConfig.plugins);
            expect(loaderOptionsPlugin.options.minimize).to.equal(true);
            expect(loaderOptionsPlugin.options.debug).to.equal(false);

            const moduleHashedIdsPlugin = findPlugin(webpack.HashedModuleIdsPlugin, actualConfig.plugins);
            expect(moduleHashedIdsPlugin).to.not.be.undefined;

            const definePlugin = findPlugin(webpack.DefinePlugin, actualConfig.plugins);
            expect(definePlugin.definitions['process.env'].NODE_ENV).to.equal('"production"');

            const uglifyPlugin = findPlugin(webpack.optimize.UglifyJsPlugin, actualConfig.plugins);
            expect(uglifyPlugin).to.not.be.undefined;
        });
    });

    describe('enablePostCssLoader() adds the postcss-loader', () => {
        it('enablePostCssLoader(false)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enablePostCssLoader(false);

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('postcss-loader')
        });

        it('enablePostCssLoader(true)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enablePostCssLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('postcss-loader')
        });
    });

    describe('enableSassLoader() adds the sass-loader', () => {
        it('enableSassLoader(false)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableSassLoader(false);

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('sass-loader')
        });

        it('enableSassLoader(true)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableSassLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('sass-loader')
        });
    });

    describe('enableLessLoader() adds the less-loader', () => {
        it('enableLessLoader(false)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableLessLoader(false);

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('less-loader')
        });

        it('enableLessLoader(true)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableLessLoader();

            const actualConfig = configGenerator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('less-loader')
        });
    });

    describe('.js rule receives different configuration', () => {
        it('Use default config', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.jsx?$/, actualConfig.module.rules);

            // check for the default env preset only
            expect(JSON.stringify(jsRule.use.options.presets)).to.equal(JSON.stringify([['env', {"modules": false}]]));
        });

        it('useBabelRcFile() passes *no* config', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useBabelRcFile();

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.jsx?$/, actualConfig.module.rules);

            // the options should only contain the cacheDirectory option
            expect(JSON.stringify(jsRule.use.options)).to.equal(JSON.stringify({'cacheDirectory': true}));
        });

        it('configureBabel() passes babel options', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureBabel(function (babelConfig) {
                babelConfig.presets.push('foo');
            });

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.jsx?$/, actualConfig.module.rules);

            expect(jsRule.use.options.presets).to.include('foo');
        });

        it('enableReactPreset() passes react preset to babel', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enableReactPreset();
            config.configureBabel(function (babelConfig) {
                babelConfig.presets.push('foo');
            });

            const actualConfig = configGenerator(config);

            const jsRule = findRule(/\.jsx?$/, actualConfig.module.rules);

            expect(jsRule.use.options.presets).to.include('react');
            // foo is also still there, not overridden
            expect(jsRule.use.options.presets).to.include('foo');
        });
    });

    describe('cleanupOutputBeforeBuild() adds CleanWebpackPlugin', () => {
        it('without cleanupOutputBeforeBuild()', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output/public-path';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);

            const cleanPlugin = findPlugin(CleanWebpackPlugin, actualConfig.plugins);
            expect(cleanPlugin).to.be.undefined;
        });

        it('with cleanupOutputBeforeBuild()', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
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
            var config = new WebpackConfig();
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.addEntry('main', './main');

            const actualConfig = configGenerator(config);
            expect(actualConfig.devServer).to.be.undefined;
        });

        it('contentBase is calculated correctly', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build/');
            config.addEntry('main', './main');
            config.useWebpackDevServer();

            const actualConfig = configGenerator(config);
            // contentBase should point to the "document root", which
            // is calculated as outputPath, but without the publicPath portion
            expect(actualConfig.devServer.contentBase).to.equal('/tmp/public');
            expect(actualConfig.devServer.publicPath).to.equal('/build/')
        });

        it('contentBase works ok with manifestKeyPrefix', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/subdirectory/build');
            // this "fixes" the incompatibility between outputPath and publicPath
            config.setManifestKeyPrefix('/build/');
            config.addEntry('main', './main');
            config.useWebpackDevServer();

            const actualConfig = configGenerator(config);
            // contentBase should point to the "document root", which
            // is calculated as outputPath, but without the publicPath portion
            expect(actualConfig.devServer.contentBase).to.equal('/tmp/public');
            expect(actualConfig.devServer.publicPath).to.equal('/subdirectory/build/')
        });
    });
});

const expect = require('chai').expect;
const WebpackConfig = require('../lib/WebpackConfig');
const generator = require('../lib/config_generator');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

function findPlugin(pluginConstructor, plugins) {
    for (let plugin of plugins) {
        if (plugin instanceof pluginConstructor) {
            return plugin;
        }
    }

    throw new Error(`No plugin found for ${pluginConstructor.name}`);
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

describe('The config_generator function', () => {

    describe('Test basic output properties', () => {
        it('Returns an object with the correct properties', () => {
            var config = new WebpackConfig();
            // setting explicitly to make test more dependable
            config.context = '/foo/dir';
            config.addEntry('main', './main');
            config.publicPath = '/';
            config.outputPath = '/tmp';

            const actualConfig = generator(config);

            expect(actualConfig.context).to.equal('/foo/dir');
            expect(actualConfig.entry).to.be.an('object');
            expect(actualConfig.output).to.be.an('object');
            expect(actualConfig.module).to.be.an('object');
            expect(actualConfig.plugins).to.be.an('Array');
        });

        it('throws an error if there are no entries', () => {
            var config = new WebpackConfig();
            config.publicPath = '/';
            config.outputPath = '/tmp';

            expect(() => {
                generator(config);
            }).to.throw('No entries found!');
        });

        it('throws an error if there is no output path', () => {
            var config = new WebpackConfig();
            config.publicPath = '/';
            config.addEntry('main', './main');

            expect(() => {
                generator(config);
            }).to.throw('Missing output path');
        });

        it('throws an error if there is no public path', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp';
            config.addEntry('main', './main');

            expect(() => {
                generator(config);
            }).to.throw('Missing public path');
        });

        it('entries and styleEntries are merged', () => {
            var config = new WebpackConfig();
            config.publicPath = '/';
            config.outputPath = '/tmp';
            config.addEntry('main', './main');
            config.addStyleEntry('style', ['./bootstrap.css', './main.css']);
            config.addEntry('main2', './main2');

            const actualConfig = generator(config);

            expect(JSON.stringify(actualConfig.entry)).to.equal(JSON.stringify({
                main: './main',
                main2: './main2',
                style: ['./bootstrap.css', './main.css']
            }));
        });

        it('basic output', () => {
            var config = new WebpackConfig();

            config.outputPath = '/tmp';
            config.publicPath = '/public-path/';
            config.addEntry('main', './main');

            const actualConfig = generator(config);

            expect(JSON.stringify(actualConfig.output)).to.equal(JSON.stringify({
                path: '/tmp',
                filename: '[name].js',
                publicPath: '/public-path/'
            }));
        });
    });

    describe('Test source maps changes', () => {
        it('without sourcemaps', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useSourceMaps = false;

            const actualConfig = generator(config);
            expect(actualConfig.devtool).to.be.undefined;

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('?sourceMap')
        });

        it('with sourcemaps', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useSourceMaps = true;

            const actualConfig = generator(config);
            expect(actualConfig.devtool).to.equal('#inline-source-map');

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('?sourceMap')
        });
    });

    describe('Test versioning changes', () => {
        it('with versioning', () => {
            var config = new WebpackConfig();
            config.outputPath = '/tmp';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useVersioning = true;

            const actualConfig = generator(config);
            expect(actualConfig.output.filename).to.equal('[name].[chunkhash].js');

            const extractTextPlugin = findPlugin(ExtractTextPlugin, actualConfig.plugins);

            expect(extractTextPlugin.filename).to.equal('[name].[contenthash].css');
        });
    });

    describe('Test production changes', () => {
        it('not in production', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.nodeEnvironment = 'dev';

            const actualConfig = generator(config);

            const loaderOptionsPlugin = findPlugin(webpack.LoaderOptionsPlugin, actualConfig.plugins);
            expect(loaderOptionsPlugin.options.minimize).to.equal(false);
            expect(loaderOptionsPlugin.options.debug).to.equal(true);
            expect(loaderOptionsPlugin.options.options.context).to.equal('/tmp/context');
            expect(loaderOptionsPlugin.options.options.output.path).to.equal('/tmp/output');

            const moduleNamePlugin = findPlugin(webpack.NamedModulesPlugin, actualConfig.plugins);
            expect(moduleNamePlugin).to.not.be.undefined;
        });

        it('YES to production', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.nodeEnvironment = 'production';

            const actualConfig = generator(config);

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

    describe('enabledPostCSS() adds the postcss-loader', () => {
        it('enabledPostCSS(false)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enablePostCss(false);

            const actualConfig = generator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.not.contain('postcss-loader')
        });

        it('enabledPostCSS(true)', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.enablePostCss();

            const actualConfig = generator(config);

            expect(JSON.stringify(actualConfig.module.rules)).to.contain('postcss-loader')
        });
    });

    describe('babel configuration files control babel-loader options', () => {
        it('Use default config', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');

            const actualConfig = generator(config);

            const jsRule = findRule(/\.js$/, actualConfig.module.rules);

            // check for the default env preset only
            expect(JSON.stringify(jsRule.use.options)).to.equal(JSON.stringify({presets: ['env']}));
        });

        it('useBabelRcFile() passes *no* config', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.useBabelRcFile();

            const actualConfig = generator(config);

            const jsRule = findRule(/\.js$/, actualConfig.module.rules);

            // the options should be completely omitted
            expect(jsRule.use.options).to.be.undefined;
        });

        it('configureBabel() passes babel options', () => {
            var config = new WebpackConfig();
            config.context = '/tmp/context';
            config.outputPath = '/tmp/output';
            config.publicPath = '/public-path';
            config.addEntry('main', './main');
            config.configureBabel({
                "presets": ["foo", "env"]
            });

            const actualConfig = generator(config);

            const jsRule = findRule(/\.js$/, actualConfig.module.rules);

            expect(jsRule.use.options.presets).to.have.all.members(["foo", "env"]);
        });
    });

    // todo devServer
});

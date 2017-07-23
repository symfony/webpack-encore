/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const extractText = require('./loaders/extract-text');
const pathUtil = require('./config/path-util');
// loaders utils
const cssLoaderUtil = require('./loaders/css');
const sassLoaderUtil = require('./loaders/sass');
const lessLoaderUtil = require('./loaders/less');
const babelLoaderUtil = require('./loaders/babel');
const tsLoaderUtil = require('./loaders/typescript');
const vueLoaderUtil = require('./loaders/vue');
// plugins utils
const extractTextPluginUtil = require('./plugins/extract-text');
const deleteUnusedEntriesPluginUtil = require('./plugins/delete-unused-entries');
const manifestPluginUtil = require('./plugins/manifest');
const loaderOptionsPluginUtil = require('./plugins/loader-options');
const versioningPluginUtil = require('./plugins/versioning');
const variableProviderPluginUtil = require('./plugins/variable-provider');
const cleanPluginUtil = require('./plugins/clean');
const commonChunksPluginUtil = require('./plugins/common-chunks');
const definePluginUtil = require('./plugins/define');
const uglifyPluginUtil = require('./plugins/uglify');
const friendlyErrorPluginUtil = require('./plugins/friendly-errors');
const assetOutputDisplay = require('./plugins/asset-output-display');

class ConfigGenerator {
    /**
     * @param {WebpackConfig} webpackConfig
     */
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    getWebpackConfig() {
        const config = {
            context: this.webpackConfig.getContext(),
            entry: this.buildEntryConfig(),
            output: this.buildOutputConfig(),
            module: {
                rules: this.buildRulesConfig(),
            },
            plugins: this.buildPluginsConfig(),
        };

        if (this.webpackConfig.useSourceMaps) {
            if (this.webpackConfig.isProduction()) {
                // https://webpack.js.org/configuration/devtool/#for-production
                config.devtool = 'source-map';
            } else {
                // https://webpack.js.org/configuration/devtool/#for-development
                config.devtool = 'inline-source-map';
            }
        }

        if (this.webpackConfig.useDevServer()) {
            config.devServer = this.buildDevServerConfig();
        }

        config.performance = {
            // silence performance hints
            hints: false
        };

        config.stats = this.buildStatsConfig();

        config.resolve = {
            extensions: ['.js', '.jsx', '.vue', '.ts', '.tsx'],
            alias: {}
        };

        if (this.webpackConfig.useVueLoader) {
            config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';
        }

        return config;
    }

    buildEntryConfig() {
        const entry = {};

        for (const [entryName, entryChunks] of this.webpackConfig.entries) {
            // entryFile could be an array, we don't care
            entry[entryName] = entryChunks;
        }

        for (const [entryName, entryChunks] of this.webpackConfig.styleEntries) {
            // entryFile could be an array, we don't care
            entry[entryName] = entryChunks;
        }

        return entry;
    }

    buildOutputConfig() {
        return {
            path: this.webpackConfig.outputPath,
            filename: this.webpackConfig.useVersioning ? '[name].[chunkhash].js' : '[name].js',
            // will use the CDN path (if one is available) so that split
            // chunks load internally through the CDN.
            publicPath: this.webpackConfig.getRealPublicPath(),
            pathinfo: this.webpackConfig.isProduction()
        };
    }

    buildRulesConfig() {
        let rules = [
            {
                // match .js and .jsx
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: babelLoaderUtil.getLoaders(this.webpackConfig)
            },
            {
                test: /\.css$/,
                use: extractText.extract(this.webpackConfig, cssLoaderUtil.getLoaders(this.webpackConfig, false))
            },
            {
                test: /\.(png|jpg|jpeg|gif|ico|svg)$/,
                loader: 'file-loader',
                options: {
                    name: `images/[name]${this.webpackConfig.useVersioning ? '.[hash]' : ''}.[ext]`,
                    publicPath: this.webpackConfig.getRealPublicPath()
                }
            },
            {
                test: /\.(woff|woff2|ttf|eot|otf)$/,
                loader: 'file-loader',
                options: {
                    name: `fonts/[name]${this.webpackConfig.useVersioning ? '.[hash]' : ''}.[ext]`,
                    publicPath: this.webpackConfig.getRealPublicPath()
                }
            },
        ];

        if (this.webpackConfig.useSassLoader) {
            rules.push({
                test: /\.s[ac]ss$/,
                use: extractText.extract(this.webpackConfig, sassLoaderUtil.getLoaders(this.webpackConfig))
            });
        }

        if (this.webpackConfig.useLessLoader) {
            rules.push({
                test: /\.less/,
                use: extractText.extract(this.webpackConfig, lessLoaderUtil.getLoaders(this.webpackConfig))
            });
        }

        if (this.webpackConfig.useVueLoader) {
            rules.push({
                test: /\.vue$/,
                use: vueLoaderUtil.getLoaders(this.webpackConfig, this.webpackConfig.vueLoaderOptionsCallback)
            });
        }

        if (this.webpackConfig.useTypeScriptLoader) {
            this.webpackConfig.addLoader({
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: tsLoaderUtil.getLoaders(this.webpackConfig)
            });
        }

        this.webpackConfig.loaders.forEach((loader) => {
            rules.push(loader);
        });

        return rules;
    }

    buildPluginsConfig() {
        let plugins = [];

        extractTextPluginUtil(plugins, this.webpackConfig);

        // register the pure-style entries that should be deleted
        deleteUnusedEntriesPluginUtil(plugins, this.webpackConfig);

        // Dump the manifest.json file
        manifestPluginUtil(plugins, this.webpackConfig);

        loaderOptionsPluginUtil(plugins, this.webpackConfig);

        versioningPluginUtil(plugins, this.webpackConfig);

        variableProviderPluginUtil(plugins, this.webpackConfig);

        cleanPluginUtil(plugins, this.webpackConfig, ['**/*']);

        commonChunksPluginUtil(plugins, this.webpackConfig);

        // todo - options here should be configurable
        definePluginUtil(plugins, this.webpackConfig);
        uglifyPluginUtil(plugins, this.webpackConfig);

        let friendlyErrorPlugin = friendlyErrorPluginUtil();
        plugins.push(friendlyErrorPlugin);

        assetOutputDisplay(plugins, this.webpackConfig, friendlyErrorPlugin);

        this.webpackConfig.plugins.forEach(function(plugin) {
            plugins.push(plugin);
        });

        return plugins;
    }

    buildStatsConfig() {
        // try to silence as much as possible: the output is rarely helpful
        // this still doesn't remove all output
        return {
            hash: false,
            version: false,
            timings: false,
            assets: false,
            chunks: false,
            maxModules: 0,
            modules: false,
            reasons: false,
            children: false,
            source: false,
            errors: false,
            errorDetails: false,
            warnings: false,
            publicPath: false,
        };
    }

    buildDevServerConfig() {
        const contentBase = pathUtil.getContentBase(this.webpackConfig);

        return {
            contentBase: contentBase,
            publicPath: this.webpackConfig.publicPath,
            // avoid CORS concerns trying to load things like fonts from the dev server
            headers: { 'Access-Control-Allow-Origin': '*' },
            // required by FriendlyErrorsWebpackPlugin
            hot: this.webpackConfig.useHotModuleReplacementPlugin(),
            quiet: true,
            compress: true,
            historyApiFallback: true,
            watchOptions: {
                ignored: /node_modules/
            },
            https: this.webpackConfig.useDevServerInHttps()
        };
    }
}

/**
 * @param {WebpackConfig} webpackConfig A configured WebpackConfig object
 *
 * @return {*} The final webpack config object
 */
module.exports = function(webpackConfig) {
    const generator = new ConfigGenerator(webpackConfig);

    return generator.getWebpackConfig();
};

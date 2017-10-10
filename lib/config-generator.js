/*
 * This file is part of the Symfony Webpack Encore package.
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
const commonsChunksPluginUtil = require('./plugins/commons-chunks');
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

        if (this.webpackConfig.usePreact && this.webpackConfig.preactOptions.preactCompat) {
            config.resolve.alias['react'] = 'preact-compat';
            config.resolve.alias['react-dom'] = 'preact-compat';
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
        // Default filename can be overriden using Encore.configureFilenames({ js: '...' })
        let filename = this.webpackConfig.useVersioning ? '[name].[chunkhash].js' : '[name].js';
        if (this.webpackConfig.configuredFilenames.js) {
            filename = this.webpackConfig.configuredFilenames.js;
        }

        return {
            path: this.webpackConfig.outputPath,
            filename: filename,
            // will use the CDN path (if one is available) so that split
            // chunks load internally through the CDN.
            publicPath: this.webpackConfig.getRealPublicPath(),
            pathinfo: !this.webpackConfig.isProduction()
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
            }
        ];

        if (this.webpackConfig.useImagesLoader) {
            // Default filename can be overriden using Encore.configureFilenames({ images: '...' })
            let filename = 'images/[name].[hash:8].[ext]';
            if (this.webpackConfig.configuredFilenames.images) {
                filename = this.webpackConfig.configuredFilenames.images;
            }

            rules.push({
                test: /\.(png|jpg|jpeg|gif|ico|svg|webp)$/,
                loader: 'file-loader',
                options: {
                    name: filename,
                    publicPath: this.webpackConfig.getRealPublicPath()
                }
            });
        }

        if (this.webpackConfig.useFontsLoader) {
            // Default filename can be overriden using Encore.configureFilenames({ fonts: '...' })
            let filename = 'fonts/[name].[hash:8].[ext]';
            if (this.webpackConfig.configuredFilenames.fonts) {
                filename = this.webpackConfig.configuredFilenames.fonts;
            }

            rules.push({
                test: /\.(woff|woff2|ttf|eot|otf)$/,
                loader: 'file-loader',
                options: {
                    name: filename,
                    publicPath: this.webpackConfig.getRealPublicPath()
                }
            });
        }

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

        cleanPluginUtil(plugins, this.webpackConfig);

        commonsChunksPluginUtil(plugins, this.webpackConfig);

        definePluginUtil(plugins, this.webpackConfig);

        uglifyPluginUtil(plugins, this.webpackConfig);

        const friendlyErrorPlugin = friendlyErrorPluginUtil(this.webpackConfig);
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
            // this doesn't appear to be necessary, but here in case
            publicPath: this.webpackConfig.getRealPublicPath(),
            // avoid CORS concerns trying to load things like fonts from the dev server
            headers: { 'Access-Control-Allow-Origin': '*' },
            hot: this.webpackConfig.useHotModuleReplacementPlugin(),
            // required by FriendlyErrorsWebpackPlugin
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

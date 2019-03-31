/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('./WebpackConfig'); //eslint-disable-line no-unused-vars
const cssExtractLoaderUtil = require('./loaders/css-extract');
const pathUtil = require('./config/path-util');
const loaderFeatures = require('./features');
// loaders utils
const cssLoaderUtil = require('./loaders/css');
const sassLoaderUtil = require('./loaders/sass');
const lessLoaderUtil = require('./loaders/less');
const stylusLoaderUtil = require('./loaders/stylus');
const babelLoaderUtil = require('./loaders/babel');
const tsLoaderUtil = require('./loaders/typescript');
const vueLoaderUtil = require('./loaders/vue');
const handlebarsLoaderUtil = require('./loaders/handlebars');
const eslintLoaderUtil = require('./loaders/eslint');
// plugins utils
const miniCssExtractPluginUtil = require('./plugins/mini-css-extract');
const deleteUnusedEntriesPluginUtil = require('./plugins/delete-unused-entries');
const entryFilesManifestPlugin = require('./plugins/entry-files-manifest');
const manifestPluginUtil = require('./plugins/manifest');
const versioningPluginUtil = require('./plugins/versioning');
const variableProviderPluginUtil = require('./plugins/variable-provider');
const cleanPluginUtil = require('./plugins/clean');
const definePluginUtil = require('./plugins/define');
const terserPluginUtil = require('./plugins/terser');
const optimizeCssAssetsUtil = require('./plugins/optimize-css-assets');
const vuePluginUtil = require('./plugins/vue');
const friendlyErrorPluginUtil = require('./plugins/friendly-errors');
const assetOutputDisplay = require('./plugins/asset-output-display');
const notifierPluginUtil = require('./plugins/notifier');
const sharedEntryConcatPuginUtil = require('./plugins/shared-entry-concat');
const PluginPriorities = require('./plugins/plugin-priorities');
const applyOptionsCallback = require('./utils/apply-options-callback');
const sharedEntryTmpName = require('./utils/sharedEntryTmpName');
const copyEntryTmpName = require('./utils/copyEntryTmpName');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');
const stringEscaper = require('./utils/string-escaper');
const crypto = require('crypto');
const logger = require('./logger');
const os = require('os');

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
            mode: this.webpackConfig.isProduction() ? 'production' : 'development',
            output: this.buildOutputConfig(),
            module: {
                rules: this.buildRulesConfig(),
            },
            plugins: this.buildPluginsConfig(),
            optimization: this.buildOptimizationConfig(),
            watchOptions: this.buildWatchOptionsConfig()
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
            extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx', '.vue', '.ts', '.tsx'],
            alias: Object.assign({}, this.webpackConfig.aliases)
        };

        if (this.webpackConfig.useVueLoader) {
            config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';
        }

        if (this.webpackConfig.usePreact && this.webpackConfig.preactOptions.preactCompat) {
            config.resolve.alias['react'] = 'preact-compat';
            config.resolve.alias['react-dom'] = 'preact-compat';
        }

        config.externals = [...this.webpackConfig.externals];

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

        if (this.webpackConfig.sharedCommonsEntryName) {
            /*
             * This is a hack: we need to create a new "entry"
             * file that simply requires the same file that
             * the "shared entry" requires.
             *
             * See shared-entry-concat-plugin.js for more details.
             */
            const staticHashKey = crypto
                .createHash('md4')
                .update(this.webpackConfig.outputPath)
                .digest('hex')
                .slice(0, 8);
            const tmpFilename = path.join(os.tmpdir(), '_webpack_encore_tmp_module' + staticHashKey + '.js');
            const pathToRequire = path.resolve(this.webpackConfig.getContext(), this.webpackConfig.sharedCommonsEntryFile);
            fs.writeFileSync(
                tmpFilename,
                `require('${stringEscaper(pathToRequire)}')`
            );

            entry[sharedEntryTmpName] = tmpFilename;
        }

        const copyFilesConfigs = this.webpackConfig.copyFilesConfigs.filter(entry => {
            const copyFrom = path.resolve(
                this.webpackConfig.getContext(),
                entry.from
            );

            if (!fs.existsSync(copyFrom)) {
                logger.warning(`The "from" option of copyFiles() should be set to an existing directory but "${entry.from}" does not seem to exist. Nothing will be copied for this copyFiles() config object.`);
                return false;
            }

            if (!fs.lstatSync(copyFrom).isDirectory()) {
                logger.warning(`The "from" option of copyFiles() should be set to an existing directory but "${entry.from}" seems to be a file. Nothing will be copied for this copyFiles() config object.`);
                return false;
            }

            return true;
        });

        if (copyFilesConfigs.length > 0) {
            const tmpFileObject = tmp.fileSync();
            fs.writeFileSync(
                tmpFileObject.name,
                copyFilesConfigs.reduce((buffer, entry, index) => {
                    const copyFrom = path.resolve(
                        this.webpackConfig.getContext(),
                        entry.from
                    );

                    let copyTo = entry.to;
                    if (copyTo === null) {
                        copyTo = this.webpackConfig.useVersioning ? '[path][name].[hash:8].[ext]' : '[path][name].[ext]';
                    }

                    const copyFilesLoader = require.resolve('./webpack/copy-files-loader');
                    const fileLoader = require.resolve('file-loader');
                    const copyContext = entry.context ? path.resolve(this.webpackConfig.getContext(), entry.context) : copyFrom;
                    const requireContextParam = `!${copyFilesLoader}!${fileLoader}?context=${copyContext}&name=${copyTo}!${copyFrom}`;

                    return buffer + `
                        const context_${index} = require.context(
                            '${stringEscaper(requireContextParam)}',
                            ${!!entry.includeSubdirectories},
                            ${entry.pattern}
                        );
                        context_${index}.keys().forEach(context_${index});
                    `;
                }, '')
            );

            entry[copyEntryTmpName] = tmpFileObject.name;
        }

        return entry;
    }

    buildOutputConfig() {
        // Default filename can be overridden using Encore.configureFilenames({ js: '...' })
        let filename = this.webpackConfig.useVersioning ? '[name].[contenthash:8].js' : '[name].js';
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
        const applyRuleConfigurationCallback = (name, defaultRules) => {
            return applyOptionsCallback(this.webpackConfig.loaderConfigurationCallbacks[name], defaultRules);
        };

        let rules = [
            applyRuleConfigurationCallback('javascript', {
                // match .js and .jsx
                test: /\.jsx?$/,
                exclude: this.webpackConfig.babelOptions.exclude,
                use: babelLoaderUtil.getLoaders(this.webpackConfig)
            }),
            applyRuleConfigurationCallback('css', {
                resolve: {
                    mainFields: ['style', 'main'],
                    extensions: ['.css'],
                },
                test: /\.css$/,
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(
                            this.webpackConfig,
                            cssLoaderUtil.getLoaders(this.webpackConfig, true)
                        )
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(
                            this.webpackConfig,
                            cssLoaderUtil.getLoaders(this.webpackConfig)
                        )
                    }
                ]
            })
        ];

        if (this.webpackConfig.useImagesLoader) {
            // Default filename can be overridden using Encore.configureFilenames({ images: '...' })
            let filename = 'images/[name].[hash:8].[ext]';
            if (this.webpackConfig.configuredFilenames.images) {
                filename = this.webpackConfig.configuredFilenames.images;
            }

            // The url-loader can be used instead of the default file-loader by
            // calling Encore.configureUrlLoader({ images: {/* ... */}})
            let loaderName = 'file-loader';
            const loaderOptions = {
                name: filename,
                publicPath: this.webpackConfig.getRealPublicPath()
            };

            if (this.webpackConfig.urlLoaderOptions.images) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('urlloader');
                loaderName = 'url-loader';
                Object.assign(loaderOptions, this.webpackConfig.urlLoaderOptions.images);
            }

            rules.push(applyRuleConfigurationCallback('images', {
                test: /\.(png|jpg|jpeg|gif|ico|svg|webp)$/,
                loader: loaderName,
                options: loaderOptions
            }));
        }

        if (this.webpackConfig.useFontsLoader) {
            // Default filename can be overridden using Encore.configureFilenames({ fonts: '...' })
            let filename = 'fonts/[name].[hash:8].[ext]';
            if (this.webpackConfig.configuredFilenames.fonts) {
                filename = this.webpackConfig.configuredFilenames.fonts;
            }

            // The url-loader can be used instead of the default file-loader by
            // calling Encore.configureUrlLoader({ fonts: {/* ... */}})
            let loaderName = 'file-loader';
            const loaderOptions = {
                name: filename,
                publicPath: this.webpackConfig.getRealPublicPath()
            };

            if (this.webpackConfig.urlLoaderOptions.fonts) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('urlloader');
                loaderName = 'url-loader';
                Object.assign(loaderOptions, this.webpackConfig.urlLoaderOptions.fonts);
            }

            rules.push(applyRuleConfigurationCallback('fonts', {
                test: /\.(woff|woff2|ttf|eot|otf)$/,
                loader: loaderName,
                options: loaderOptions
            }));
        }

        if (this.webpackConfig.useSassLoader) {
            rules.push(applyRuleConfigurationCallback('sass', {
                resolve: {
                    mainFields: ['sass', 'style', 'main'],
                    extensions: ['.scss', '.sass', '.css']
                },
                test: /\.s[ac]ss$/,
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, sassLoaderUtil.getLoaders(this.webpackConfig, true))
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, sassLoaderUtil.getLoaders(this.webpackConfig))
                    }
                ]
            }));
        }

        if (this.webpackConfig.useLessLoader) {
            rules.push(applyRuleConfigurationCallback('less', {
                test: /\.less/,
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, lessLoaderUtil.getLoaders(this.webpackConfig, true))
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, lessLoaderUtil.getLoaders(this.webpackConfig))
                    }
                ]
            }));
        }

        if (this.webpackConfig.useStylusLoader) {
            rules.push(applyRuleConfigurationCallback('stylus', {
                test: /\.styl/,
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, stylusLoaderUtil.getLoaders(this.webpackConfig, true))
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, stylusLoaderUtil.getLoaders(this.webpackConfig))
                    }
                ]
            }));
        }

        if (this.webpackConfig.useVueLoader) {
            rules.push(applyRuleConfigurationCallback('vue', {
                test: /\.vue$/,
                use: vueLoaderUtil.getLoaders(this.webpackConfig)
            }));
        }

        if (this.webpackConfig.useEslintLoader) {
            rules.push(applyRuleConfigurationCallback('eslint', {
                test: /\.jsx?$/,
                loader: 'eslint-loader',
                exclude: /node_modules/,
                enforce: 'pre',
                options: eslintLoaderUtil.getOptions(this.webpackConfig)
            }));
        }

        if (this.webpackConfig.useTypeScriptLoader) {
            rules.push(applyRuleConfigurationCallback('typescript', {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: tsLoaderUtil.getLoaders(this.webpackConfig)
            }));
        }

        if (this.webpackConfig.useHandlebarsLoader) {
            rules.push(applyRuleConfigurationCallback('handlebars', {
                test: /\.(handlebars|hbs)$/,
                use: handlebarsLoaderUtil.getLoaders(this.webpackConfig)
            }));
        }

        this.webpackConfig.loaders.forEach((loader) => {
            rules.push(loader);
        });

        return rules;
    }

    buildPluginsConfig() {
        const plugins = [];

        if (this.webpackConfig.extractCss) {
            miniCssExtractPluginUtil(plugins, this.webpackConfig);
        }

        // register the pure-style entries that should be deleted
        deleteUnusedEntriesPluginUtil(plugins, this.webpackConfig);

        entryFilesManifestPlugin(plugins, this.webpackConfig);

        // Dump the manifest.json file
        manifestPluginUtil(plugins, this.webpackConfig);

        versioningPluginUtil(plugins, this.webpackConfig);

        variableProviderPluginUtil(plugins, this.webpackConfig);

        cleanPluginUtil(plugins, this.webpackConfig);

        definePluginUtil(plugins, this.webpackConfig);

        notifierPluginUtil(plugins, this.webpackConfig);

        vuePluginUtil(plugins, this.webpackConfig);

        if (!this.webpackConfig.runtimeConfig.outputJson) {
            const friendlyErrorPlugin = friendlyErrorPluginUtil(this.webpackConfig);
            plugins.push({
                plugin: friendlyErrorPlugin,
                priority: PluginPriorities.FriendlyErrorsWebpackPlugin
            });

            assetOutputDisplay(plugins, this.webpackConfig, friendlyErrorPlugin);
        }

        sharedEntryConcatPuginUtil(plugins, this.webpackConfig);

        this.webpackConfig.plugins.forEach(function(plugin) {
            plugins.push(plugin);
        });

        // Return sorted plugins
        return plugins
            .map((plugin, position) => Object.assign({}, plugin, { position: position }))
            .sort((a, b) => {
                // Keep the original order if two plugins have the same priority
                if (a.priority === b.priority) {
                    return a.position - b.position;
                }

                // A plugin with a priority of -10 will be placed after one
                // that has a priority of 0.
                return b.priority - a.priority;
            })
            .map((plugin) => plugin.plugin);
    }

    buildOptimizationConfig() {
        const optimization = {

        };

        if (this.webpackConfig.isProduction()) {
            optimization.minimizer = [
                terserPluginUtil(this.webpackConfig),
                optimizeCssAssetsUtil(this.webpackConfig)
            ];
        } else {
            // see versioning.js: this gives us friendly module names,
            // which can be useful for debugging, especially with HMR
            optimization.namedModules = true;
        }
        // https://github.com/webpack/webpack/issues/8354
        // likely can be removed in Webpack 5
        // https://github.com/webpack/webpack/pull/8374
        optimization.chunkIds = 'named';

        let splitChunks = {
            chunks: this.webpackConfig.shouldSplitEntryChunks ? 'all' : 'async'
        };

        // This causes the split filenames (& internal names) to be,
        // for example, 0.js. This is needed so that the filename
        // doesn't change suddenly when another entry needs that same
        // shared code (e.g. vendor~entry1~entry2.js).
        // https://github.com/webpack/webpack/issues/8426#issuecomment-442375207
        if (this.webpackConfig.shouldSplitEntryChunks && this.webpackConfig.isProduction()) {
            splitChunks.name = false;
        }

        if (this.webpackConfig.sharedCommonsEntryName) {
            const cacheGroups = {};
            cacheGroups[this.webpackConfig.sharedCommonsEntryName] = {
                chunks: 'initial',
                name: this.webpackConfig.sharedCommonsEntryName,
                // important: setting this to the entry name means that
                // all modules included by that entry go into this cache group
                test: this.webpackConfig.sharedCommonsEntryName,
                // seems to default the rest of the options (like minSize)
                // to settings so that modules matched by "test" are
                // *definitely* included.
                enforce: true,
            };

            splitChunks.cacheGroups = cacheGroups;
        }

        switch (this.webpackConfig.shouldUseSingleRuntimeChunk) {
            case true:
                // causes a runtime.js to be emitted with the Webpack runtime
                // this is important as a default because it causes different entry
                // files to "share" modules, instead of each module getting their own
                // fresh version of each module.
                optimization.runtimeChunk = 'single';
                break;
            case false:
                // add no runtimeChunk configuration
                break;
            case null:
                /*
                 * Not setting this option explicitly is deprecated.
                 */
                logger.deprecation('Either the Encore.enableSingleRuntimeChunk() or Encore.disableSingleRuntimeChunk() method should be called.');
                if (this.webpackConfig.sharedCommonsEntryName) {
                    logger.deprecation('Because you\'re using createSharedEntry(), the recommended setting is Encore.enableSingleRuntimeChunk().');
                    logger.deprecation('After calling Encore.enableSingleRuntimeChunk(), the "manifest.js" file will be called "runtime.js": your script tag will need to be updated.');
                    // output it, but keep the old filename
                    optimization.runtimeChunk = {
                        name: 'manifest'
                    };
                } else {
                    logger.deprecation('The recommended setting is Encore.enableSingleRuntimeChunk().');
                    logger.deprecation('After calling Encore.enableSingleRuntimeChunk(), a new "runtime.js" will be output and should be included on your page before any other script tags for Encore files.');
                    // do not output the runtime
                }

                break;
        }

        optimization.splitChunks = applyOptionsCallback(
            this.webpackConfig.splitChunksConfigurationCallback,
            splitChunks
        );

        return optimization;
    }

    buildStatsConfig() {
        // try to silence as much as possible: the output is rarely helpful
        // this still doesn't remove all output
        let stats = {};

        if (!this.webpackConfig.runtimeConfig.outputJson && !this.webpackConfig.runtimeConfig.profile) {
            stats = {
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
                builtAt: false,
            };
        }

        return stats;
    }

    buildWatchOptionsConfig() {
        const watchOptions = {
            ignored: /node_modules/
        };

        return applyOptionsCallback(
            this.webpackConfig.watchOptionsConfigurationCallback,
            watchOptions
        );
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
            watchOptions: this.buildWatchOptionsConfig(),
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

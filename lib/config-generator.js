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
const featuresHelper = require('./features');
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
const variableProviderPluginUtil = require('./plugins/variable-provider');
const cleanPluginUtil = require('./plugins/clean');
const definePluginUtil = require('./plugins/define');
const terserPluginUtil = require('./plugins/terser');
const optimizeCssAssetsUtil = require('./plugins/optimize-css-assets');
const vuePluginUtil = require('./plugins/vue');
const friendlyErrorPluginUtil = require('./plugins/friendly-errors');
const assetOutputDisplay = require('./plugins/asset-output-display');
const notifierPluginUtil = require('./plugins/notifier');
const eslintPluginUtil = require('./plugins/eslint');
const PluginPriorities = require('./plugins/plugin-priorities');
const applyOptionsCallback = require('./utils/apply-options-callback');
const copyEntryTmpName = require('./utils/copyEntryTmpName');
const getVueVersion = require('./utils/get-vue-version');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');
const stringEscaper = require('./utils/string-escaper');
const logger = require('./logger');

class ConfigGenerator {
    /**
     * @param {WebpackConfig} webpackConfig
     */
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    getWebpackConfig() {
        const devServerConfig = this.webpackConfig.useDevServer() ? this.buildDevServerConfig() : null;
        /*
         * An unfortunate situation where we need to configure the final runtime
         * config later in the process. The problem is that devServer https can
         * be activated with either a --https flag or by setting the devServer.https
         * config to an object or true. So, only at this moment can we determine
         * if https has been activated by either method.
         */
        if (this.webpackConfig.useDevServer() && (devServerConfig.https || this.webpackConfig.runtimeConfig.devServerHttps)) {
            this.webpackConfig.runtimeConfig.devServerFinalIsHttps = true;
        } else {
            this.webpackConfig.runtimeConfig.devServerFinalIsHttps = false;
        }

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
            watchOptions: this.buildWatchOptionsConfig(),
            devtool: false,
        };

        if (this.webpackConfig.usePersistentCache) {
            config.cache = this.buildCacheConfig();
        }

        if (this.webpackConfig.useSourceMaps) {
            if (this.webpackConfig.isProduction()) {
                // https://webpack.js.org/configuration/devtool/#for-production
                config.devtool = 'source-map';
            } else {
                // https://webpack.js.org/configuration/devtool/#for-development
                config.devtool = 'inline-source-map';
            }
        }

        if (null !== devServerConfig) {
            config.devServer = devServerConfig;
        }

        config.performance = {
            // silence performance hints
            hints: false
        };

        config.stats = this.buildStatsConfig();

        config.resolve = {
            extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx', '.vue', '.ts', '.tsx'],
            alias: {}
        };

        if (this.webpackConfig.useVueLoader && (this.webpackConfig.vueOptions.runtimeCompilerBuild === true || this.webpackConfig.vueOptions.runtimeCompilerBuild === null)) {
            if (this.webpackConfig.vueOptions.runtimeCompilerBuild === null) {
                logger.recommendation('To create a smaller (and CSP-compliant) build, see https://symfony.com/doc/current/frontend/encore/vuejs.html#runtime-compiler-build');
            }

            const vueVersion = getVueVersion(this.webpackConfig);
            switch (vueVersion) {
                case 2:
                    config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';
                    break;
                case 3:
                    config.resolve.alias['vue$'] = 'vue/dist/vue.esm-bundler.js';
                    break;
                default:
                    throw new Error(`Invalid vue version ${vueVersion}`);
            }
        }

        if (this.webpackConfig.usePreact && this.webpackConfig.preactOptions.preactCompat) {
            config.resolve.alias['react'] = 'preact-compat';
            config.resolve.alias['react-dom'] = 'preact-compat';
        }

        Object.assign(config.resolve.alias, this.webpackConfig.aliases);

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

        if (this.webpackConfig.copyFilesConfigs.length > 0) {
            featuresHelper.ensurePackagesExistAndAreCorrectVersion('copy_files');
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

                    const copyFilesLoaderPath = require.resolve('./webpack/copy-files-loader');
                    const copyFilesLoaderConfig = `${copyFilesLoaderPath}?${JSON.stringify({
                        // file-loader options
                        context: entry.context ? path.resolve(this.webpackConfig.getContext(), entry.context) : copyFrom,
                        name: copyTo,

                        // custom copy-files-loader options
                        // the patternSource is base64 encoded in case
                        // it contains characters that don't work with
                        // the "inline loader" syntax
                        patternSource: Buffer.from(entry.pattern.source).toString('base64'),
                        patternFlags: entry.pattern.flags,
                    })}`;

                    return buffer + `
                        const context_${index} = require.context(
                            '${stringEscaper(`!!${copyFilesLoaderConfig}!${copyFrom}?copy-files-loader`)}',
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
            // default "asset module" filename
            // this is overridden for the image & font rules
            assetModuleFilename: this.webpackConfig.configuredFilenames.assets ? this.webpackConfig.configuredFilenames.assets : 'assets/[name].[hash:8][ext]',
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

        const generateAssetRuleConfig = (testRegex, ruleOptions, ruleCallback, ruleName) => {
            const generatorOptions = {};
            if (ruleOptions.filename) {
                generatorOptions.filename = ruleOptions.filename;
            }
            const parserOptions = {};
            if (ruleOptions.maxSize) {
                parserOptions.dataUrlCondition = {
                    maxSize: ruleOptions.maxSize,
                };
            }

            // apply callback from, for example, configureImageRule()
            const ruleConfig = applyOptionsCallback(
                ruleCallback,
                {
                    test: testRegex,
                    oneOf: [
                        {
                            resourceQuery: /copy-files-loader/,
                            type: 'javascript/auto',
                        },{
                            type: ruleOptions.type,
                            generator: generatorOptions,
                            parser: parserOptions
                        }
                    ]
                },
            );

            // apply callback from lower-level configureLoaderRule()
            return applyRuleConfigurationCallback(ruleName, ruleConfig);
        };

        // When the PostCSS loader is enabled, allow to use
        // files with the `.postcss` extension. It also
        // makes it possible to use `lang="postcss"` in Vue
        // files.
        const cssExtensions = ['css'];
        if (this.webpackConfig.usePostCssLoader) {
            cssExtensions.push('pcss');
            cssExtensions.push('postcss');
        }

        let rules = [
            applyRuleConfigurationCallback('javascript', {
                test: babelLoaderUtil.getTest(this.webpackConfig),
                exclude: this.webpackConfig.babelOptions.exclude,
                use: babelLoaderUtil.getLoaders(this.webpackConfig)
            }),
            applyRuleConfigurationCallback('css', {
                resolve: {
                    mainFields: ['style', 'main'],
                    extensions: cssExtensions.map(ext => `.${ext}`),
                },
                test: new RegExp(`\\.(${cssExtensions.join('|')})$`),
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

        if (this.webpackConfig.imageRuleOptions.enabled) {
            rules.push(generateAssetRuleConfig(
                /\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/,
                this.webpackConfig.imageRuleOptions,
                this.webpackConfig.imageRuleCallback,
                'images'
            ));
        }

        if (this.webpackConfig.fontRuleOptions.enabled) {
            rules.push(generateAssetRuleConfig(
                /\.(woff|woff2|ttf|eot|otf)$/,
                this.webpackConfig.fontRuleOptions,
                this.webpackConfig.fontRuleCallback,
                'fonts'
            ));
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
                test: eslintLoaderUtil.getTest(this.webpackConfig),
                loader: require.resolve('eslint-loader'), //eslint-disable-line node/no-unpublished-require
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

        miniCssExtractPluginUtil(plugins, this.webpackConfig);

        // register the pure-style entries that should be deleted
        deleteUnusedEntriesPluginUtil(plugins, this.webpackConfig);

        entryFilesManifestPlugin(plugins, this.webpackConfig);

        // Dump the manifest.json file
        manifestPluginUtil(plugins, this.webpackConfig);

        variableProviderPluginUtil(plugins, this.webpackConfig);

        cleanPluginUtil(plugins, this.webpackConfig);

        definePluginUtil(plugins, this.webpackConfig);

        notifierPluginUtil(plugins, this.webpackConfig);

        vuePluginUtil(plugins, this.webpackConfig);

        eslintPluginUtil(plugins, this.webpackConfig);

        if (!this.webpackConfig.runtimeConfig.outputJson) {
            const friendlyErrorPlugin = friendlyErrorPluginUtil(this.webpackConfig);
            plugins.push({
                plugin: friendlyErrorPlugin,
                priority: PluginPriorities.FriendlyErrorsWebpackPlugin
            });

            assetOutputDisplay(plugins, this.webpackConfig, friendlyErrorPlugin);
        }

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
        }

        const splitChunks = {
            chunks: this.webpackConfig.shouldSplitEntryChunks ? 'all' : 'async'
        };

        const cacheGroups = {};

        for (const groupName in this.webpackConfig.cacheGroups) {
            cacheGroups[groupName] = Object.assign(
                {
                    name: groupName,
                    chunks: 'all',
                    enforce: true
                },
                this.webpackConfig.cacheGroups[groupName]
            );
        }

        splitChunks.cacheGroups = cacheGroups;

        if (this.webpackConfig.shouldUseSingleRuntimeChunk === null) {
            throw new Error('Either the Encore.enableSingleRuntimeChunk() or Encore.disableSingleRuntimeChunk() method should be called. The recommended setting is Encore.enableSingleRuntimeChunk().');
        }

        if (this.webpackConfig.shouldUseSingleRuntimeChunk) {
            optimization.runtimeChunk = 'single';
        }

        optimization.splitChunks = applyOptionsCallback(
            this.webpackConfig.splitChunksConfigurationCallback,
            splitChunks
        );

        return optimization;
    }

    buildCacheConfig() {
        const cache = {};

        cache.type = 'filesystem';
        cache.buildDependencies = this.webpackConfig.persistentCacheBuildDependencies;

        applyOptionsCallback(
            this.webpackConfig.persistentCacheCallback,
            cache
        );

        return cache;
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

        const devServerOptions = {
            static: {
                directory: contentBase,
            },
            // avoid CORS concerns trying to load things like fonts from the dev server
            headers: { 'Access-Control-Allow-Origin': '*' },
            compress: true,
            historyApiFallback: true,
            // In webpack-dev-server v4 beta 0, liveReload always causes
            // the page to refresh, not allowing HMR to update the page.
            // This is somehow related to the "static" option, but it's
            // unknown if there is a better option.
            // See https://github.com/webpack/webpack-dev-server/issues/2893
            liveReload: false,
            // see https://github.com/symfony/webpack-encore/issues/931#issuecomment-784483725
            host: this.webpackConfig.runtimeConfig.devServerHost,
            // see https://github.com/symfony/webpack-encore/issues/941#issuecomment-787568811
            // we cannot let webpack-dev-server find an open port, because we need
            // to know the port for sure at Webpack config build time
            port: this.webpackConfig.runtimeConfig.devServerPort,
        };

        return applyOptionsCallback(
            this.webpackConfig.devServerOptionsConfigurationCallback,
            devServerOptions
        );
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

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('./webpack/webpack-manifest-plugin');
const DeleteUnusedEntriesJSPlugin = require('./webpack/delete-unused-entries-js-plugin');
const AssetsOutputDisplayPlugin = require('./friendly-errors/asset-output-display-plugin');
const loaderFeatures = require('./loader-features');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const missingLoaderTransformer = require('./friendly-errors/transformers/missing-loader');
const missingLoaderFormatter = require('./friendly-errors/formatters/missing-loader');
const missingPostCssConfigTransformer = require('./friendly-errors/transformers/missing-postcss-config');
const missingPostCssConfigFormatter = require('./friendly-errors/formatters/missing-postcss-config');

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
            extensions: ['.js', '.jsx']
        };

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
        const cssLoaders = [
            {
                loader: 'css-loader' + this.getSourceMapOption() + (this.webpackConfig.isProduction() ? '?minimize=1' : ''),
            },
        ];
        if (this.webpackConfig.usePostCssLoader) {
            loaderFeatures.ensureLoaderPackagesExist('postcss');

            cssLoaders.push({
                loader: 'postcss-loader' + this.getSourceMapOption(),
            });
        }

        let babelConfig = {
            // improves performance by caching babel compiles
            // we add this option ALWAYS
            // https://github.com/babel/babel-loader#options
            cacheDirectory: true
        };

        // configure babel (unless the user is specifying .babelrc)
        // todo - add a sanity check for their babelrc contents
        if (!this.webpackConfig.doesBabelRcFileExist()) {
            Object.assign(babelConfig, {
                presets: [
                    ['env', {
                        // modules don't need to be transformed - webpack will parse
                        // the modules for us. This is a performance improvement
                        // https://babeljs.io/docs/plugins/preset-env/#optionsmodules
                        modules: false,
                        targets: {
                            browsers: '> 1%',
                            uglify: true
                        },
                        useBuiltIns: true
                    }]
                ],
            });

            if (this.webpackConfig.useReact) {
                loaderFeatures.ensureLoaderPackagesExist('react');

                babelConfig.presets.push('react');
            }

            // allow for babel config to be controlled
            this.webpackConfig.babelConfigurationCallback.apply(
                // use babelConfig as the this variable
                babelConfig,
                [babelConfig]
            );
        }

        let rules = [];
        rules.push({
            // match .js and .jsx
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: babelConfig
            }
        });

        rules = rules.concat([
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader' + this.getSourceMapOption(),
                    use: cssLoaders
                })
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
        ]);

        if (this.webpackConfig.useSassLoader) {
            loaderFeatures.ensureLoaderPackagesExist('sass');

            const sassLoaders = [...cssLoaders];
            if (true === this.webpackConfig.sassOptions.resolve_url_loader) {
                // responsible for resolving SASS url() paths
                // without this, all url() paths must be relative to the
                // entry file, not the file that contains the url()
                sassLoaders.push({
                    loader: 'resolve-url-loader' + this.getSourceMapOption(),
                });
            }

            sassLoaders.push({
                loader: 'sass-loader',
                options: {
                    // needed by the resolve-url-loader
                    sourceMap: (true === this.webpackConfig.sassOptions.resolve_url_loader) || this.webpackConfig.useSourceMaps
                }
            });

            rules.push({
                test: /\.s[ac]ss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader' + this.getSourceMapOption(),
                    use: sassLoaders
                })
            });
        }

        if (this.webpackConfig.useLessLoader) {
            loaderFeatures.ensureLoaderPackagesExist('less');

            rules.push({
                test: /\.less/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader' + this.getSourceMapOption(),
                    use: [
                        ...cssLoaders,
                        {
                            loader: 'less-loader' + this.getSourceMapOption()
                        },
                    ]
                })
            });
        }

        return rules;
    }

    buildPluginsConfig() {
        let plugins = [];

        /*
         * All CSS/SCSS content (due to the loaders above) will be
         * extracted into an [entrypointname].css files. The result
         * is that NO css will be inlined, *except* CSS that is required
         * in an async way (e.g. via require.ensure()).
         *
         * This may not be ideal in some cases, but it's at least
         * predictable. It means that you must manually add a
         * link tag for an entry point's CSS (unless no CSS file
         * was imported - in which case no CSS file will be dumped).
         */
        plugins.push(new ExtractTextPlugin({
            filename: this.webpackConfig.useVersioning ? '[name].[contenthash].css' : '[name].css',
            // if true, async CSS (e.g. loaded via require.ensure())
            // is extracted to the entry point CSS. If false, it's
            // inlined in the AJAX-loaded .js file.
            allChunks: false
        }));

        // register the pure-style entries that should be deleted
        plugins.push(new DeleteUnusedEntriesJSPlugin(
            // transform into an Array
            [... this.webpackConfig.styleEntries.keys()]
        ));

        /*
         * Dump the manifest.json file
         */
        let manifestPrefix = this.webpackConfig.manifestKeyPrefix;
        if (null === manifestPrefix) {
            // by convention, we remove the opening slash on the manifest keys
            manifestPrefix = this.webpackConfig.publicPath.replace(/^\//,'');
        }
        plugins.push(new ManifestPlugin({
            basePath: manifestPrefix,
            // guarantee the value uses the public path (or CDN public path)
            publicPath: this.webpackConfig.getRealPublicPath(),
            // always write a manifest.json file, even with webpack-dev-server
            writeToFileEmit: true,
        }));

        /*
         * This section is a bit mysterious. The "minimize"
         * true is read and used to minify the CSS.
         * But as soon as this plugin is included
         * at all, SASS begins to have errors, until the context
         * and output options are specified. At this time, I'm
         * not totally sure what's going on here
         * https://github.com/jtangelder/sass-loader/issues/285
         */
        plugins.push(new webpack.LoaderOptionsPlugin({
            debug: !this.webpackConfig.isProduction(),
            options: {
                context: this.webpackConfig.getContext(),
                output: { path: this.webpackConfig.outputPath }
            }
        }));

        /*
         * With versioning, the "chunkhash" used in the filenames and
         * the module ids (i.e. the internal names of modules that
         * are required) become important. Specifically:
         *
         * 1) If the contents of a module don't change, then you don't want its
         *    internal module id to change. Otherwise, whatever file holds the
         *    webpack "manifest" will change because the module id will change.
         *    Solved by HashedModuleIdsPlugin or NamedModulesPlugin
         *
         * 2) Similarly, if the final contents of a file don't change,
         *    then we also don't want that file to have a new filename.
         *    The WebpackChunkHash() handles this, by making sure that
         *    the chunkhash is based off of the file contents.
         *
         * Even in the webpack community, the ideal setup seems to be
         * a bit of a mystery:
         *  * https://github.com/webpack/webpack/issues/1315
         *  * https://github.com/webpack/webpack.js.org/issues/652#issuecomment-273324529
         *  * https://webpack.js.org/guides/caching/#deterministic-hashes
         */
        // when not using versioning, none of this is important
        if (this.webpackConfig.useVersioning) {
            let moduleNamePlugin;
            if (this.webpackConfig.isProduction()) {
                // shorter, and obfuscated module ids
                moduleNamePlugin = new webpack.HashedModuleIdsPlugin();
            } else {
                // human-readable module names, helps debug in HMR
                moduleNamePlugin = new webpack.NamedModulesPlugin();
            }
            plugins = plugins.concat([
                moduleNamePlugin,
                new WebpackChunkHash()
            ]);
        }

        if (Object.keys(this.webpackConfig.providedVariables).length > 0) {
            plugins = plugins.concat([
                new webpack.ProvidePlugin(this.webpackConfig.providedVariables)
            ]);
        }

        if (this.webpackConfig.cleanupOutput) {
            plugins.push(
                new CleanWebpackPlugin([this.webpackConfig.outputPath], {
                    verbose: false,
                    /*
                     * Instead of passing the "root" option and then making
                     * the first argument (this.webpackConfig.outputPath) relative
                     * to that (e.g. "builds"), we pass the absolute path as
                     * the first argument. To the plugin, this looks like a
                     * path that is "outside of the project root". This flag
                     * says to ignore that.
                     */
                    allowExternal: true
                })
            );
        }

        // if we're extracting a vendor chunk, set it up!
        if (this.webpackConfig.sharedCommonsEntryName) {
            plugins = plugins.concat([
                new webpack.optimize.CommonsChunkPlugin({
                    name: [
                        this.webpackConfig.sharedCommonsEntryName,
                        /*
                         * Always dump a 2nd file - manifest.json that
                         * will contain the webpack manifest information.
                         * This changes frequently, and without this line,
                         * it would be packaged inside the "shared commons entry"
                         * file - e.g. vendor.js, which would prevent long-term caching.
                         */
                        'manifest'
                    ],
                    minChunks: Infinity,
                }),
            ]);
        }

        if (this.webpackConfig.isProduction()) {
            plugins = plugins.concat([
                new webpack.DefinePlugin({
                    'process.env': {
                        NODE_ENV: '"production"'
                    }
                }),

                // todo - options here should be configurable
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: this.webpackConfig.useSourceMaps
                })
            ]);
        }

        const friendlyErrorsPlugin = new FriendlyErrorsWebpackPlugin({
            clearConsole: false,
            additionalTransformers: [
                missingLoaderTransformer,
                missingPostCssConfigTransformer
            ],
            additionalFormatters: [
                missingLoaderFormatter,
                missingPostCssConfigFormatter
            ],
            compilationSuccessInfo: {
                messages: []
            }
        });
        plugins.push(friendlyErrorsPlugin);

        const outputPath = this.webpackConfig.outputPath.replace(this.webpackConfig.getContext() + '/', '');
        plugins.push(new AssetsOutputDisplayPlugin(outputPath, friendlyErrorsPlugin));

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
        // strip trailing slash
        const outputPath = this.webpackConfig.outputPath.replace(/\/$/,'');
        // use the manifestKeyPrefix if available
        const publicPath = this.webpackConfig.manifestKeyPrefix ? this.webpackConfig.manifestKeyPrefix.replace(/\/$/,'') : this.webpackConfig.publicPath.replace(/\/$/,'');

        /*
         * We use the intersection of the publicPath and outputPath to determine
         * "document root" of the web server. For example:
         *   * outputPath = /var/www/public/build
         *   * publicPath = /build/
         *      => contentBase should be /var/www/public
         */
        if (outputPath.indexOf(publicPath) === -1) {
            throw new Error(`Unable to determine contentBase option for webpack's devServer configuration. The publicPath (${this.webpackConfig.publicPath}) string does not exist in the outputPath (${this.webpackConfig.outputPath}), and so the "document root" cannot be determined.`);
        }

        // a non-regex replace
        const contentBase = outputPath.split(publicPath).join('');

        return {
            contentBase: contentBase,
            publicPath: this.webpackConfig.publicPath,
            // avoid CORS concerns trying to load things like fonts from the dev server
            headers: { 'Access-Control-Allow-Origin': '*' },
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

    getSourceMapOption() {
        return this.webpackConfig.useSourceMaps ? '?sourceMap' : '';
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

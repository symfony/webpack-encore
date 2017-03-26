const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const DeleteUnusedEntriesJSPlugin = require('./DeleteUnusedEntriesJSPlugin');
const packageHelper = require('./package-helper');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');

class ConfigGenerator
{
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    getWebpackConfig() {
        const config = {
            context: this.webpackConfig.context,
            entry: this.buildEntryConfig(),
            output: this.buildOutputConfig(),
            module: {
                rules: this.buildRulesConfig(),
            },
            plugins: this.buildPluginsConfig()
        };

        if (this.webpackConfig.useSourceMaps) {
            // todo this should be configurable
            config.devtool = '#inline-source-map';
        }

        config.devServer = {
            // todo - make port (+ other stuff?) configurable
            // todo - bah! I think this should point to web, not web/builds!
            contentBase: __dirname+'/web',
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

        if (Object.keys(entry).length == 0) {
            throw new Error('No entries found! You must call addEntry() or addStyleEntry() at least once - otherwise... there is nothing to webpack!');
        }

        return entry;
    }

    buildOutputConfig() {
        if (this.webpackConfig.outputPath === null) {
            throw new Error('Missing output path: Call setOutputPath() to control where the files will be written.');
        }

        if (this.webpackConfig.publicPath === null) {
            throw new Error('Missing public path: Call setPublicPath() to control the public path relative to where the files are written (the output path).');
        }

        return {
            path: this.webpackConfig.outputPath,
            filename: this.webpackConfig.useVersioning ? '[name].[chunkhash].js' : '[name].js',
            publicPath: this.webpackConfig.publicPath
        };
    }

    buildRulesConfig() {
        var cssLoaders = [
            {
                loader: 'css-loader'+this.getSourceMapOption(),
            },
        ];
        if (this.webpackConfig.usePostCss) {
            cssLoaders.push({
                loader: 'postcss-loader'+this.getSourceMapOption(),
            });
        }

        let babelConfig = {
            // improves performance by caching babel compiles
            // we add this option ALWAYS
            // https://github.com/babel/babel-loader#options
            cacheDirectory: true
        };

        // configure babel (unless the user is specifying .babelrc)
        if (!this.webpackConfig.allowBabelRcFile) {
            Object.assign(babelConfig, {
                presets: [
                    ['env', {
                        // modules don't need to be transformed - webpack will parse
                        // the modules for us. This is a performance improvement
                        // https://babeljs.io/docs/plugins/preset-env/#optionsmodules
                        modules: false
                    }]
                ],
            });

            if (this.webpackConfig.useReact) {
                packageHelper.ensurePackageExists(
                    'babel-preset-react',
                    'You must install the "babel-preset-react" package to use enableReact().'
                );

                babelConfig.presets.push('react');
            }

            // allow for babel config to be controlled
            this.webpackConfig.babelConfigurationCallback.apply(
                // use babelConfig as the this variable
                babelConfig,
                [babelConfig]
            );
        }

        var rules = [];
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
                    fallback: 'style-loader'+this.getSourceMapOption(),
                    use: cssLoaders
                })
            },
            {
                test: /\.s[ac]ss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader'+this.getSourceMapOption(),
                    use: [
                        ...cssLoaders,
                        {
                            loader: 'resolve-url-loader'+this.getSourceMapOption(),
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                precision: 8,
                                outputStyle: 'expanded',
                                // always enabled, needed by resolve-url-loader
                                sourceMap: true
                            }
                        },
                    ]
                })
            },
            {
                test: /\.(png|jpe?g|gif|ico)$/,
                loader: 'file-loader',
                options: {
                    name: `images/[name]${this.webpackConfig.useVersioning ? '.[hash]' : ''}.[ext]`,
                    publicPath: this.webpackConfig.publicPath
                }
            },
            {
                test: /\.(woff2?|ttf|eot|svg|otf)$/,
                loader: 'file-loader',
                options: {
                    name: `fonts/[name]${this.webpackConfig.useVersioning ? '.[hash]' : ''}.[ext]`,
                    publicPath: this.webpackConfig.publicPath
                }
            },
        ]);

        if (this.webpackConfig.useLess) {
            packageHelper.ensurePackageExists(
                'less-loader',
                'You must install the "less-loader" package to use enableLess().'
            );

            rules.push({
                test: /\.less/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader'+this.getSourceMapOption(),
                    use: [
                        ...cssLoaders,
                        {
                            loader: 'less-loader'+this.getSourceMapOption()
                        },
                    ]
                })
            })
        }

        return rules;
    }

    buildPluginsConfig() {
        let plugins = [
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
            new ExtractTextPlugin({
                filename: this.webpackConfig.useVersioning ? '[name].[contenthash].css' : '[name].css',
                // if true, async CSS (e.g. loaded via react.ensure())
                // is extracted to the entry point CSS. If false, it's
                // inlined in the AJAX-loaded .js file.
                allChunks: false
            }),

            // register the pure-style entries that should be deleted
            // should we instantiate this once in construct? And then
            // just add style entries to it along the way?
            new DeleteUnusedEntriesJSPlugin(
                [... this.webpackConfig.styleEntries.keys()]
            ),

            // dumps the manifest.json file
            new ManifestPlugin({
                publicPath: this.webpackConfig.publicPath,
                writeToFileEmit: true
            }),

            /**
             * This section is a bit mysterious. The "minimize"
             * true is read and used to minify the CSS.
             * But as soon as this plugin is included
             * at all, SASS begins to have errors, until the context
             * and output options are specified. At this time, I'm
             * quite unsure what's going on here
             * https://github.com/jtangelder/sass-loader/issues/285
             */
            new webpack.LoaderOptionsPlugin({
                minimize: this.webpackConfig.isProduction(),
                debug: !this.webpackConfig.isProduction(),
                options: {
                    context: this.webpackConfig.context,
                    output: { path: this.webpackConfig.outputPath }
                }
            })
        ];

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
                new webpack.optimize.UglifyJsPlugin({})
            ]);
        }

        return plugins;
    }

    getSourceMapOption() {
        return this.webpackConfig.useSourceMaps ? '?sourceMap' : '';
    }
}

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {*}
 */
module.exports = function(webpackConfig) {
    const generator = new ConfigGenerator(webpackConfig);

    return generator.getWebpackConfig();
};

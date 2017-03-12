const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const DeleteUnusedEntriesJSPlugin = require('./DeleteUnusedEntriesJSPlugin');

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

            // if a CDN is provided, use that for the public path so
            // that split chunks load via the CDN
            publicPath: this.webpackConfig.publicCDNPath ? this.webpackConfig.publicCDNPath : this.webpackConfig.publicPath
        };
    }

    buildRulesConfig() {
        return [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader'+this.getSourceMapOption(),
                    use: 'css-loader'+this.getSourceMapOption(),
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader'+this.getSourceMapOption(),
                    use: [
                        {
                            loader: 'css-loader'+this.getSourceMapOption(),
                        },
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
            // todo - re-add conditionally (or require the less-loader)
            // {
            //     test: /\.less/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: 'style-loader'+getSourceMapOption(WebpackConfig),
            //         use: [
            //             {
            //                 loader: 'css-loader'+getSourceMapOption(WebpackConfig)
            //             },
            //             {
            //                 loader: 'less-loader'+getSourceMapOption(WebpackConfig)
            //             },
            //         ]
            //     })
            // },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader',
                options: {
                    name: 'images/[name].[hash].[ext]',
                    publicPath: '/'
                }
            },
            {
                test: /\.(woff2?|ttf|eot|svg|otf)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[hash].[ext]',
                    publicPath: '/'
                }
            },
        ];
    }

    buildPluginsConfig() {
        let plugins = [
            /*
             * All CSS/SCSS content (due to the loaders above) will be
             * extracted into an [entrypointname].css file the result
             * is that NO css will be inlined.
             *
             * This may not be ideal in some cases, but it's at least
             * predictable. It means that you must manually add a
             * link tag for an entry point's CSS (unless no CSS file
             * was imported - in which case no CSS file is dumped).
             */
            new ExtractTextPlugin({
                filename: this.webpackConfig.useVersioning ? '[name].[contenthash].css' : '[name].css',
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
                // prefixes all keys with builds/, which allows us to refer to
                // the paths as builds/main.css in Twig, instead of just main.css
                // strip the opening slash
                basePath: this.webpackConfig.publicPath.replace(/^\//,"")
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

        let moduleNamePlugin;
        if (this.webpackConfig.isProduction()) {
            // shorter, and obfuscated module ids
            moduleNamePlugin = new webpack.HashedModuleIdsPlugin();
        } else {
            // human-readable module names, helps debug in HMR
            moduleNamePlugin = new webpack.NamedModulesPlugin();
        }
        plugins = plugins.concat([moduleNamePlugin]);

        if (Object.keys(this.webpackConfig.providedVariables).length > 0) {
            plugins = plugins.concat([
                new webpack.ProvidePlugin(this.webpackConfig.providedVariables)
            ]);
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

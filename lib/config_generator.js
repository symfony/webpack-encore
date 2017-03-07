const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const DeleteUnusedEntriesJSPlugin = require('./DeleteUnusedEntriesJSPlugin');

function getWebpackConfig(Remix) {
    const config = {
        context: WebpackConfig.context,
        entry: buildEntryConfig(Remix),
        output: buildOutputConfig(Remix),
        module: {
            rules: buildRulesConfig(Remix),
        },
        plugins: buildPluginsConfig(Remix)
    };

    if (Remix.useSourceMaps) {
        // todo this should be configurable
        config.devtool = '#inline-source-map';
    }

    config.devServer = {
        // todo - make port (other stuff?) configurable
        // todo - bah! I think this should point to web, not web/builds!
        contentBase: __dirname+'/web',
    };

    return config;
}

function buildEntryConfig(Remix) {
    const entry = {};

    for (const [entryName, entryChunks] of Remix.entries) {
        // entryFile could be an array, we don't care
        entry[entryName] = entryChunks;
    }

    for (const [entryName, entryChunks] of Remix.styleEntries) {
        // entryFile could be an array, we don't care
        entry[entryName] = entryChunks;
    }

    return entry;
}

function buildOutputConfig(Remix) {
    return {
        path: Remix.outputPath, // ./web/builds
        // todo - this would need have the hash later
        filename: Remix.useVersioning ? '[name].[chunkhash].js' : '[name].js',

        // if a CDN is provided, use that for the public path so
        // that split chunks load via the CDN
        publicPath: Remix.publicCDNPath ? Remix.publicCDNPath : Remix.publicPath
    };
}

function getSourceMapOption(Remix) {
    return Remix.useSourceMaps ? '?sourceMap' : '';
}

function buildRulesConfig(Remix) {
    return [
        {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader'+getSourceMapOption(Remix),
                use: 'css-loader'+getSourceMapOption(Remix),
            })
        },
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader'+getSourceMapOption(Remix),
                use: [
                    {
                        loader: 'css-loader'+getSourceMapOption(Remix),
                    },
                    {
                        loader: 'resolve-url-loader'+getSourceMapOption(Remix),
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
                name: 'images/[name].[ext]?[hash]',
                publicPath: '/'
            }
        },
        {
            test: /\.(woff2?|ttf|eot|svg|otf)$/,
            loader: 'file-loader',
            options: {
                name: 'fonts/[name].[ext]?[hash]',
                publicPath: '/'
            }
        },
    ];
}

function buildPluginsConfig(Remix) {
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
            filename: Remix.useVersioning ? '[name].[contenthash].css' : '[name].css',
            allChunks: false
        }),

        // register the pure-style entries that should be deleted
        // should we instantiate this once in construct? And then
        // just add style entries to it along the way?
        new DeleteUnusedEntriesJSPlugin(
            [... Remix.styleEntries.keys()]
        ),

        // dumps the manifest.json file
        new ManifestPlugin({
            // prefixes all keys with builds/, which allows us to refer to
            // the paths as builds/main.css in Twig, instead of just main.css
            // strip the opening slash
            basePath: Remix.publicPath.replace(/^\//,"")
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
            minimize: Remix.isProduction(),
            debug: !Remix.isProduction(),
            options: {
                context: Remix.context,
                output: { path: Remix.outputPath }
            }
        })
    ];

    let moduleNamePlugin;
    if (Remix.isProduction()) {
        // shorter, and obfuscated module ids
        moduleNamePlugin = new webpack.HashedModuleIdsPlugin();
    } else {
        // human-readable module names, helps debug in HMR
        moduleNamePlugin = new webpack.NamedModulesPlugin();
    }
    plugins = plugins.concat([moduleNamePlugin]);

    if (Object.keys(Remix.providedVariables).length > 0) {
        plugins = plugins.concat([
            new webpack.ProvidePlugin(Remix.providedVariables)
        ]);
    }

    // if we're extracting a vendor chunk, set it up!
    if (Remix.sharedCommonsEntryName) {
        plugins = plugins.concat([
            new webpack.optimize.CommonsChunkPlugin({
                name: [Remix.sharedCommonsEntryName, 'manifest'],
                minChunks: Infinity,
            }),
        ]);
    }

    if (Remix.isProduction()) {
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

module.exports = getWebpackConfig;

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const pkgUp = require('pkg-up');

class WebpackConfig {
    constructor(nodeEnv = null) {
        this.context = null;
        this.outputPath = null;
        this.publicPath = null;
        this.publicCDNPath = null;
        this.webpackDevServerUrl = null;
        this.entries = new Map();
        this.styleEntries = new Map();
        this.useVersioning = false;
        this.useSourceMaps = false;
        this.usePostCss = false;
        this.useLess = false;
        this.cleanupOutput = false;
        this.sharedCommonsEntryName = null;
        this.providedVariables = {};
        this.babelConfigurationCallback = function() {};
        this.allowBabelRcFile = false;
        this.useReact = false;

        this.nodeEnvironment = nodeEnv !== null ? nodeEnv : process.env.NODE_ENV;
    }

    setContext(context) {
        if (null !== this.context) {
            throw new Error(`Make sure to call setContext() at the top of your configuration (before adding any entries).`);
        }

        this.context = context;
    }

    getContext() {
        if (null === this.context) {
            // context = cwd(), then find package.json file
            const packagesPath = pkgUp.sync(process.cwd());
            if (null === packagesPath) {
                throw new Error(`Cannot determine webpack context. (Are you executing webpack from a directory outside of your project?). Call setContext() manually at the *top* of your webpack.config.js configuration.`);
            }

            this.context = path.dirname(packagesPath);
        }

        return this.context;
    }

    setOutputPath(outputPath) {
        if(!path.isAbsolute(outputPath)) {
            outputPath = path.resolve(this.getContext(), outputPath);
        }

        if (!fs.existsSync(outputPath)) {
            // for safety, we won't recursively create directories
            // this might be a sign that the user has specified
            // an incorrect path
            if (!fs.existsSync(path.dirname(outputPath))) {
                throw new Error(`outputPath directory does not exist: ${outputPath}. Please check the path you're passing to setOutputPath() or create this directory`);
            }

            fs.mkdirSync(outputPath);
        }

        this.outputPath = outputPath;
    }

    setPublicPath(publicPath) {
        /*
         * Do not allow full URLs, because these will become the
         * keys in the manifest file, which is probably not what
         * we want!
         */
        if (publicPath.includes('://')) {
            throw new Error('Invalid argument passed to setPublicPath(): you must pass a path (e.g. /assets) not a full URL (see setPublicCDNPath).');
        }

        if (publicPath.indexOf('/') !== 0) {
            // technically, not starting with "/" is legal, but not
            // what you want in most cases. Let's not let the user make
            // a mistake (and we can always change this later).
            throw new Error('The value passed to setPublicPath() must start with "/" or be a full URL (http://...)');
        }

        // guarantee a single trailing slash
        publicPath = publicPath.replace(/\/$/,"");
        publicPath = publicPath+'/';

        this.publicPath = publicPath;
    }

    setPublicCDNPath(publicCDNPath) {
        if (this.webpackDevServerUrl) {
            throw new Error('You cannot use setPublicCDNPath() and useWebpackDevServer() at the same time. Try conditionally adding each by using Remix.isProduction().');
        }

        if (!publicCDNPath.includes('://')) {
            throw new Error('Invalid argument passed to setPublicCDNPath(): you must pass an absolute URL (e.g. https://example.org/assets) not a path.');
        }

        // guarantee a single trailing slash
        publicCDNPath = publicCDNPath.replace(/\/$/,"");
        publicCDNPath = publicCDNPath+'/';

        this.publicCDNPath = publicCDNPath;
    }

    useWebpackDevServer(webpackDevServerUrl = null) {
        // allow false to be passed to disable
        if (false === webpackDevServerUrl) {
            this.webpackDevServerUrl = null;

            return;
        }

        // if true, then use the default URL (set below)
        if (true === webpackDevServerUrl) {
            webpackDevServerUrl = null;
        }

        if (this.publicCDNPath) {
            throw new Error('You cannot use setPublicCDNPath() and useWebpackDevServer() at the same time. Try conditionally adding each by using Remix.isProduction().');
        }

        if (null === webpackDevServerUrl) {
            // this is the default URL when you boot up webpack-dev-server
            webpackDevServerUrl = 'http://localhost:8080';
        }

        if (!webpackDevServerUrl.includes('://')) {
            throw new Error('Invalid argument passed to webpackDevServerUrl(): you must pass an absolute URL (e.g. http://localhost:8090).');
        }

        // guarantee a single trailing slash
        webpackDevServerUrl = webpackDevServerUrl.replace(/\/$/,"");
        webpackDevServerUrl = webpackDevServerUrl+'/';

        this.webpackDevServerUrl = webpackDevServerUrl;
    }

    /**
     * Returns the value that should be used as the publicPath.
     *
     * If publicCDNPath is set, that is truly the publicPath,
     * and publicPath is just used for manifest path prefixing.
     *
     * @returns {string}
     */
    getRealPublicPath() {
        // if we're using webpack-dev-server, use it & add the publicPath
        if (this.webpackDevServerUrl) {
            // avoid 2 middle slashes
            return this.webpackDevServerUrl.replace(/\/$/,"") + this.publicPath;
        }

        if (this.publicCDNPath) {
            return this.publicCDNPath;
        }

        return this.publicPath;
    }

    addEntry(name, src) {
        if (this.entries.has(name)) {
            throw new Error(`Duplicate name "${name}" passed to addEntry(): entries must be unique.`);
        }

        // also check for styleEntries duplicates
        if (this.styleEntries.has(name)) {
            throw new Error(`The "${name}" passed to addEntry conflicts with a name passed to addStyleEntry(). The entry names between addEntry() and addStyleEntry() must be unique.`);
        }

        this.entries.set(name, src);
    }

    addStyleEntry(name, src) {
        if (this.styleEntries.has(name)) {
            throw new Error(`Duplicate name "${name}" passed to addStyleEntry: entries must be unique.`);
        }

        // also check for entries duplicates
        if (this.entries.has(name)) {
            throw new Error(`The "${name}" passed to addStyleEntry() conflicts with a name passed to addEntry(). The entry names between addEntry() and addStyleEntry() must be unique.`);
        }

        // todo: should we make sure there are no JS files included in this?
        this.styleEntries.set(name, src);
    }

    enableVersioning(enabled = true) {
        this.useVersioning = enabled;
    }

    enableSourceMaps(enabled = true) {
        this.useSourceMaps = enabled;
    }

    configureBabel(callback) {
        // todo - type check on callback?
        // todo - don't allow this AND useBabelRcFile
        this.babelConfigurationCallback = callback;
    }

    useBabelRcFile(shouldUse = true) {
        this.allowBabelRcFile = shouldUse;
    }

    /**
     *
     * @param name The chunk name (e.g. vendor)
     * @param files Array of files to put in the vendor entry
     */
    createSharedEntry(name, files) {
        // don't allow to call this twice
        if (this.sharedCommonsEntryName) {
            throw new Error('createSharedEntry() cannot be called multiple times: you can only create *one* shared entry.')
        }

        this.sharedCommonsEntryName = name;

        this.addEntry(name, files);
    }

    enablePostCss(enabled = true) {
        this.usePostCss = enabled;
    }

    enableLess(enabled = true) {
        this.useLess = enabled;
    }

    enableReact(enabled = true) {
        this.useReact = enabled;
    }

    cleanupOutputBeforeBuild() {
        this.cleanupOutput = true;
    }

    /**
     * Automatically make some variables available everywhere!
     *
     * Usage:
     *
     *  WebpackConfig.autoProvideVariables({
     *      $: 'jquery',
     *      jQuery: 'jquery'
     *  });
     *
     *  Then, whenever $ or jQuery are found in any
     *  modules, webpack will automatically require
     *  the "jquery" module so that the variable is available.
     *
     *  This is useful for older packages, that might
     *  expect jQuery (or something else) to be a global variable.
     *
     * @param variables
     */
    autoProvideVariables(variables) {
        // do a few sanity checks, so we can give better user errors
        if (typeof variables == 'string' || Array.isArray(variables)) {
            throw new Error('Invalid argument passed to autoProvideVariables: you must pass an object map - e.g. { $: "jquery" }');
        }

        // merge new variables into the object
        this.providedVariables = Object.assign(
            variables,
            this.providedVariables
        );
    }

    /**
     * Makes jQuery available everywhere. Equivalent to
     *
     *  WebpackConfig.autoProvideVariables({
     *      $: 'jquery',
     *      jQuery: 'jquery'
     *  });
     */
    autoProvidejQuery() {
        this.autoProvideVariables({
            $: 'jquery',
            jQuery: 'jquery'
        });
    }

    isProduction() {
        return this.nodeEnvironment == 'production';
    }
}

module.exports = WebpackConfig;

const path = require('path');
const fs = require('fs');
const pkgUp = require('pkg-up');

class WebpackConfig {
    constructor() {
        this.context = null;
        this.outputPath = null;
        this.publicPath = null;
        this.manifestKeyPrefix = null;
        this.webpackDevServerUrl = null;
        this.entries = new Map();
        this.styleEntries = new Map();
        this.useVersioning = false;
        this.useSourceMaps = false;
        this.usePostCssLoader = false;
        this.useSassLoader = false;
        this.useLessLoader = false;
        this.cleanupOutput = false;
        this.sharedCommonsEntryName = null;
        this.providedVariables = {};
        this.babelConfigurationCallback = function() {};
        this.allowBabelRcFile = false;
        this.useReact = false;
        this.environment = 'dev';
    }

    setEnvironment(environment) {
        if (environment !== 'production' && environment !== 'dev') {
            throw new Error(`Invalid argument "${environment}" passed to setEnvironment. Valid values are production or dev`);
        }

        this.environment = environment;
    }

    setContext(context) {
        if (null !== this.context) {
            throw new Error('Make sure to call setContext() at the top of your configuration (before adding any entries).');
        }

        this.context = context;
    }

    getContext() {
        if (null === this.context) {
            // context = cwd(), then find package.json file
            const packagesPath = pkgUp.sync(process.cwd());
            if (null === packagesPath) {
                throw new Error('Cannot determine webpack context. (Are you executing webpack from a directory outside of your project?). Call setContext() manually at the *top* of your webpack.config.js configuration.');
            }

            this.context = path.dirname(packagesPath);
        }

        return this.context;
    }

    setOutputPath(outputPath) {
        if (!path.isAbsolute(outputPath)) {
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
         * Do not allow absolute URLs *and* the webpackDevServer
         * to be used at the same time. The webpackDevServer basically
         * provides the publicPath (and so in those cases, publicPath)
         * is simply used as the default manifestKeyPrefix.
         */
        if (publicPath.includes('://')) {
            if (this.webpackDevServerUrl) {
                throw new Error('You cannot pass an absolute URL to setPublicPath() and useWebpackDevServer() at the same time. Try using Encore.isProduction() to only configure each setting when needed.');
            }
        } else {
            if (publicPath.indexOf('/') !== 0) {
                // technically, not starting with "/" is legal, but not
                // what you want in most cases. Let's not let the user make
                // a mistake (and we can always change this later).
                throw new Error('The value passed to setPublicPath() must start with "/" or be a full URL (http://...)');
            }
        }

        // guarantee a single trailing slash
        publicPath = publicPath.replace(/\/$/,'');
        publicPath = publicPath + '/';

        this.publicPath = publicPath;
    }

    setManifestKeyPrefix(manifestKeyPrefix) {
        // guarantee a single trailing slash, except for blank strings
        if (manifestKeyPrefix !== '') {
            manifestKeyPrefix = manifestKeyPrefix.replace(/\/$/, '');
            manifestKeyPrefix = manifestKeyPrefix + '/';
        }

        this.manifestKeyPrefix = manifestKeyPrefix;
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

        if (this.publicPath && this.publicPath.includes('://')) {
            throw new Error('You cannot pass an absolute URL to setPublicPath() and useWebpackDevServer() at the same time. Try using Encore.isProduction() to only configure each setting when needed.');
        }

        if (null === webpackDevServerUrl) {
            // this is the default URL when you boot up webpack-dev-server
            webpackDevServerUrl = 'http://localhost:8080';
        }

        if (!webpackDevServerUrl.includes('://')) {
            throw new Error('Invalid argument passed to webpackDevServerUrl(): you must pass an absolute URL (e.g. http://localhost:8090).');
        }

        // guarantee a single trailing slash
        webpackDevServerUrl = webpackDevServerUrl.replace(/\/$/,'');
        webpackDevServerUrl = webpackDevServerUrl + '/';

        this.webpackDevServerUrl = webpackDevServerUrl;
    }

    /**
     * Returns the value that should be used as the publicPath,
     * which can be overridden by enabling the webpackDevServer
     *
     * @returns {string}
     */
    getRealPublicPath() {
        // if we're using webpack-dev-server, use it & add the publicPath
        if (this.webpackDevServerUrl) {
            // avoid 2 middle slashes
            return this.webpackDevServerUrl.replace(/\/$/,'') + this.publicPath;
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
            throw new Error(`Duplicate name "${name}" passed to addStyleEntry(): entries must be unique.`);
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

    createSharedEntry(name, files) {
        // don't allow to call this twice
        if (this.sharedCommonsEntryName) {
            throw new Error('createSharedEntry() cannot be called multiple times: you can only create *one* shared entry.');
        }

        this.sharedCommonsEntryName = name;

        this.addEntry(name, files);
    }

    enablePostCssLoader(enabled = true) {
        this.usePostCssLoader = enabled;
    }

    enableSassLoader(enabled = true) {
        this.useSassLoader = enabled;
    }

    enableLessLoader(enabled = true) {
        this.useLessLoader = enabled;
    }

    enableReactPreset(enabled = true) {
        this.useReact = enabled;
    }

    cleanupOutputBeforeBuild() {
        this.cleanupOutput = true;
    }

    autoProvideVariables(variables) {
        // do a few sanity checks, so we can give better user errors
        if (typeof variables === 'string' || Array.isArray(variables)) {
            throw new Error('Invalid argument passed to autoProvideVariables: you must pass an object map - e.g. { $: "jquery" }');
        }

        // merge new variables into the object
        this.providedVariables = Object.assign(
            {},
            this.providedVariables,
            variables
        );
    }

    autoProvidejQuery() {
        this.autoProvideVariables({
            $: 'jquery',
            jQuery: 'jquery'
        });
    }

    isProduction() {
        return this.environment === 'production';
    }
}

module.exports = WebpackConfig;

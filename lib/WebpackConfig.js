const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const pkgUp = require('pkg-up');

class WebpackConfig {
    constructor(context = null, nodeEnv = null) {
        // context = cwd(), then find package.json file
        this.context = context !== null ? context : path.dirname(pkgUp.sync(process.cwd()));
        this.outputPath = null;
        this.publicPath = null;
        this.entries = new Map();
        this.styleEntries = new Map();
        this.useVersioning = false;
        this.useSourceMaps = false;
        this.usePostCss = false;
        this.sharedCommonsEntryName = null;
        this.providedVariables = {};
        this.babelConfigurationCallback = function() {};
        this.allowBabelRcFile = false;

        this.nodeEnvironment = nodeEnv !== null ? nodeEnv : process.env.NODE_ENV;
    }

    setOutputPath(outputPath) {
        if(!path.isAbsolute(outputPath)) {
            outputPath = path.resolve(this.context, outputPath);
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
        if (!publicPath.includes('://') && publicPath.indexOf('/') !== 0) {
            // technically, not starting with "/" is legal, but not
            // what you want in most cases. Let's not let the user make
            // a mistake (and we can always change this later).
            throw new Error('The value passed to setPublicPath() must start with "/" or be a fully URL (http://...)');
        }

        // guarantee a single trailing slash
        publicPath = publicPath.replace(/\/$/,"");
        publicPath = publicPath+'/';

        this.publicPath = publicPath;
    }

    addEntry(name, src) {
        if (this.entries.has(name)) {
            throw new Error(`Duplicate name "${name}" passed to addEntry: entries must be unique.`);
        }

        // also check for styleEntries duplicates
        if (this.styleEntries.has(name)) {
            throw new Error(`The "${name}" passed to addEntry conflicts with a name passed to addStyleEntry(). They entry names between addEntry and addStyleEntry must be unique.`);
        }

        this.entries.set(name, src);
    }

    addStyleEntry(name, src) {
        if (this.styleEntries.has(name)) {
            throw new Error(`Duplicate name "${name}" passed to addStyleEntry: entries must be unique.`);
        }

        // also check for entries duplicates
        if (this.entries.has(name)) {
            throw new Error(`The "${name}" passed to addStyleEntry conflicts with a name passed to addEntry(). They entry names between addEntry and addStyleEntry must be unique.`);
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

    /**
     * Enables the postcss-loader
     *
     * Once enabled, you must have a postcss.config.js config file.
     *
     * https://github.com/postcss/postcss-loader
     */
    enablePostCss(enabled = true) {
        this.usePostCss = enabled;
    }

    /**
     * Magically make some variables available everywhere!
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

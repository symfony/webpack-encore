const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const pkgUp = require('pkg-up');

class WebpackConfig {
    constructor(nodeEnv = null) {
        // context = cwd(), then find package.json file
        // todo - should be configurable
        this.context = path.dirname(pkgUp.sync(process.cwd()));
        this.outputPath = null;
        this.publicPath = null;
        this.publicCDNPath = null;
        this.entries = new Map();
        this.styleEntries = new Map();
        this.useVersioning = false;
        this.useSourceMaps = false;
        this.commonsVendorName = null;
        this.providedVariables = {};

        this.nodeEnvironment = nodeEnv !== null ? nodeEnv : process.env.NODE_ENV;
    }

    setOutputPath(outputPath) {
        if(!path.isAbsolute(outputPath)) {
            outputPath = path.resolve(this.context, outputPath);
        }

        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }

        // todo - some error checking on path exists eventually!
        // todo - convert to absolute path if not absolute!
        this.outputPath = outputPath;
    }

    setPublicPath(publicPath) {
        // ugly way to guarantee /path/ format
        publicPath = publicPath.replace(/^\//,"");
        publicPath = publicPath.replace(/\/$/,"");
        publicPath = '/'+publicPath+'/';

        // todo - make sure that a full URL is NOT passed here!
        // this is because (A) it would change the keys in
        // the Manifest file to be the full URLs... probably not
        // what we want

        this.publicPath = publicPath;
    }

    setPublicCDNPath(publicCdnPath) {
        // ugly way to guarantee a trailing slash
        publicCdnPath = publicCdnPath.replace(/^\//,"");
        publicCdnPath = publicCdnPath.replace(/\/$/,"");
        publicCdnPath = publicCdnPath+'/';

        this.publicCDNPath = publicCdnPath;
    }

    addEntry(name, src) {
        this.entries.set(name, src);
    }

    addStylesEntry(name, src) {
        // todo make sure there are no name conflicts with JS entries
        // make sure there are no JS files included in this
        this.styleEntries.set(name, src);
    }

    enableVersioning(enabled = true) {
        this.useVersioning = enabled;
    }

    enableSourceMaps(enabled = true) {
        this.useSourceMaps = enabled;
    }

    /**
     *
     * @param name The chunk name (e.g. vendor)
     * @param files Array of files to put in the vendor entry
     */
    extractVendorEntry(name, files) {
        this.commonsVendorName = name;

        // todo - error if there is already an entry by this name

        this.addEntry(name, files);
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

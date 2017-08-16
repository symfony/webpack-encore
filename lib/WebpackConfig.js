/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const fs = require('fs');

/**
 * @param {RuntimeConfig} runtimeConfig
 * @return {void}
 */
function validateRuntimeConfig(runtimeConfig) {
    // if you're using the encore executable, these things should never happen
    if (null === runtimeConfig.context) {
        throw new Error('RuntimeConfig.context must be set.');
    }

    if (null === runtimeConfig.babelRcFileExists) {
        throw new Error('RuntimeConfig.babelRcFileExists must be set.');
    }
}

class WebpackConfig {
    constructor(runtimeConfig) {
        validateRuntimeConfig(runtimeConfig);
        this.runtimeConfig = runtimeConfig;
        this.outputPath = null;
        this.publicPath = null;
        this.manifestKeyPrefix = null;
        this.entries = new Map();
        this.styleEntries = new Map();
        this.plugins = [];
        this.useVersioning = false;
        this.useSourceMaps = false;
        this.usePostCssLoader = false;
        this.postCssLoaderOptionsCallback = function() {};
        this.useSassLoader = false;
        this.sassLoaderOptionsCallback = function() {};
        this.sassOptions = {
            resolve_url_loader: true
        };
        this.useLessLoader = false;
        this.lessLoaderOptionsCallback = function() {};
        this.cleanupOutput = false;
        this.sharedCommonsEntryName = null;
        this.providedVariables = {};
        this.babelConfigurationCallback = function() {};
        this.useReact = false;
        this.useVueLoader = false;
        this.vueLoaderOptionsCallback = () => {};
        this.loaders = [];
        this.useTypeScriptLoader = false;
        this.tsConfigurationCallback = function() {};
        this.useForkedTypeScriptTypeChecking = false;
        this.forkedTypeScriptTypesCheckOptionsCallback = () => {};
        this.useImagesLoader = true;
        this.useFontsLoader = true;
        this.configuredFilenames = {};
    }

    getContext() {
        return this.runtimeConfig.context;
    }

    doesBabelRcFileExist() {
        return this.runtimeConfig.babelRcFileExists;
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
        if (publicPath.includes('://') === false && publicPath.indexOf('/') !== 0) {
            // technically, not starting with "/" is legal, but not
            // what you want in most cases. Let's not let the user make
            // a mistake (and we can always change this later).
            throw new Error('The value passed to setPublicPath() must start with "/" or be a full URL (http://...)');
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

    /**
     * Returns the value that should be used as the publicPath,
     * which can be overridden by enabling the webpackDevServer
     *
     * @returns {string}
     */
    getRealPublicPath() {
        if (!this.useDevServer()) {
            return this.publicPath;
        }

        if (this.runtimeConfig.devServerKeepPublicPath) {
            return this.publicPath;
        }

        if (this.publicPath.includes('://')) {
            return this.publicPath;
        }

        // if using dev-server, prefix the publicPath with the dev server URL
        return this.runtimeConfig.devServerUrl.replace(/\/$/,'') + this.publicPath;
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

        this.styleEntries.set(name, src);
    }

    addPlugin(plugin) {
        this.plugins.push(plugin);
    }

    addLoader(loader) {
        this.loaders.push(loader);
    }

    enableVersioning(enabled = true) {
        this.useVersioning = enabled;
    }

    enableSourceMaps(enabled = true) {
        this.useSourceMaps = enabled;
    }

    configureBabel(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureBabel() must be a callback function.');
        }

        if (this.doesBabelRcFileExist()) {
            throw new Error('configureBabel() cannot be called because your app already has Babel configuration (a `.babelrc` file, `.babelrc.js` file or `babel` key in `package.json`). Either put all of your Babel configuration in that file, or delete it and use this function.');
        }

        this.babelConfigurationCallback = callback;
    }

    createSharedEntry(name, files) {
        // don't allow to call this twice
        if (this.sharedCommonsEntryName) {
            throw new Error('createSharedEntry() cannot be called multiple times: you can only create *one* shared entry.');
        }

        this.sharedCommonsEntryName = name;

        this.addEntry(name, files);
    }

    enablePostCssLoader(postCssLoaderOptionsCallback = () => {}) {
        this.usePostCssLoader = true;

        if (typeof postCssLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enablePostCssLoader() must be a callback function.');
        }

        this.postCssLoaderOptionsCallback = postCssLoaderOptionsCallback;
    }

    enableSassLoader(sassLoaderOptionsCallback = () => {}, options = {}) {
        this.useSassLoader = true;

        if (typeof sassLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableSassLoader() must be a callback function.');
        }

        this.sassLoaderOptionsCallback = sassLoaderOptionsCallback;

        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.sassOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to enableSassLoader(). Valid keys are ${Object.keys(this.sassOptions).join(', ')}`);
            }

            this.sassOptions[optionKey] = options[optionKey];
        }
    }

    enableLessLoader(lessLoaderOptionsCallback = () => {}) {
        this.useLessLoader = true;

        if (typeof lessLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableLessLoader() must be a callback function.');
        }

        this.lessLoaderOptionsCallback = lessLoaderOptionsCallback;
    }

    enableReactPreset() {
        this.useReact = true;
    }

    enableTypeScriptLoader(callback = () => {}) {
        this.useTypeScriptLoader = true;

        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to enableTypeScriptLoader() must be a callback function.');
        }

        this.tsConfigurationCallback = callback;
    }

    enableForkedTypeScriptTypesChecking(forkedTypeScriptTypesCheckOptionsCallback = () => {}) {

        if (typeof forkedTypeScriptTypesCheckOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableForkedTypeScriptTypesChecking() must be a callback function.');
        }

        this.useForkedTypeScriptTypeChecking = true;
        this.forkedTypeScriptTypesCheckOptionsCallback =
            forkedTypeScriptTypesCheckOptionsCallback;
    }

    enableVueLoader(vueLoaderOptionsCallback = () => {}) {
        this.useVueLoader = true;

        if (typeof vueLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableVueLoader() must be a callback function.');
        }

        this.vueLoaderOptionsCallback = vueLoaderOptionsCallback;
    }

    disableImagesLoader() {
        this.useImagesLoader = false;
    }

    disableFontsLoader() {
        this.useFontsLoader = false;
    }

    configureFilenames(configuredFilenames = {}) {
        if (typeof configuredFilenames !== 'object') {
            throw new Error('Argument 1 to configureFilenames() must be an object.');
        }

        // Check allowed keys
        const validKeys = ['js', 'css', 'images', 'fonts'];
        for (const key of Object.keys(configuredFilenames)) {
            if (validKeys.indexOf(key) === -1) {
                throw new Error(`"${key}" is not a valid key for configureFilenames(). Valid keys: ${validKeys.join(', ')}.`);
            }
        }

        this.configuredFilenames = configuredFilenames;
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
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        });
    }

    useDevServer() {
        return this.runtimeConfig.useDevServer;
    }

    useDevServerInHttps() {
        return this.runtimeConfig.devServerHttps;
    }

    useHotModuleReplacementPlugin() {
        return this.runtimeConfig.useHotModuleReplacement;
    }

    isProduction() {
        return this.runtimeConfig.environment === 'production';
    }
}

module.exports = WebpackConfig;

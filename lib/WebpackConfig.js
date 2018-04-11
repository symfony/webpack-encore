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
const logger = require('./logger');

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
        this.entries = new Map();
        this.styleEntries = new Map();
        this.plugins = [];
        this.loaders = [];

        // Global settings
        this.outputPath = null;
        this.publicPath = null;
        this.manifestKeyPrefix = null;
        this.sharedCommonsEntryName = null;
        this.providedVariables = {};
        this.configuredFilenames = {};
        this.aliases = {};
        this.externals = {};

        // Features/Loaders flags
        this.useVersioning = false;
        this.useSourceMaps = false;
        this.cleanupOutput = false;
        this.useImagesLoader = true;
        this.useFontsLoader = true;
        this.usePostCssLoader = false;
        this.useLessLoader = false;
        this.useStylusLoader = false;
        this.useSassLoader = false;
        this.useReact = false;
        this.usePreact = false;
        this.useVueLoader = false;
        this.useTypeScriptLoader = false;
        this.useCoffeeScriptLoader = false;
        this.useForkedTypeScriptTypeChecking = false;
        this.useWebpackNotifier = false;

        // Features/Loaders options
        this.sassOptions = {
            resolveUrlLoader: true
        };
        this.preactOptions = {
            preactCompat: false
        };
        this.urlLoaderOptions = {
            images: false,
            fonts: false
        };

        // Features/Loaders options callbacks
        this.postCssLoaderOptionsCallback = () => {};
        this.sassLoaderOptionsCallback = () => {};
        this.lessLoaderOptionsCallback = () => {};
        this.stylusLoaderOptionsCallback = () => {};
        this.babelConfigurationCallback = () => {};
        this.vueLoaderOptionsCallback = () => {};
        this.tsConfigurationCallback = () => {};
        this.coffeeScriptConfigurationCallback = () => {};

        // Plugins options
        this.cleanWebpackPluginPaths = ['**/*'];

        // Plugins callbacks
        this.cleanWebpackPluginOptionsCallback = () => {};
        this.definePluginOptionsCallback = () => {};
        this.extractTextPluginOptionsCallback = () => {};
        this.forkedTypeScriptTypesCheckOptionsCallback = () => {};
        this.friendlyErrorsPluginOptionsCallback = () => {};
        this.loaderOptionsPluginOptionsCallback = () => {};
        this.manifestPluginOptionsCallback = () => {};
        this.uglifyJsPluginOptionsCallback = () => {};
        this.notifierPluginOptionsCallback = () => {};
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
            // what you want in most cases. Let's warn the user that
            // they might be making a mistake.
            logger.warning('The value passed to setPublicPath() should *usually* start with "/" or be a full URL (http://...). If you\'re not sure, then you should probably change your public path and make this message disappear.');
        }

        // guarantee a single trailing slash
        publicPath = publicPath.replace(/\/$/,'');
        publicPath = publicPath + '/';

        this.publicPath = publicPath;
    }

    setManifestKeyPrefix(manifestKeyPrefix) {
        /*
         * Normally, we make sure that the manifest keys don't start
         * with an opening "/" ever... for consistency. If you need
         * to manually specify the manifest key (e.g. because you're
         * publicPath is absolute), it's easy to accidentally add
         * an opening slash (thereby changing your key prefix) without
         * intending to. Hence, the warning.
         */
        if (manifestKeyPrefix.indexOf('/') === 0) {
            logger.warning(`The value passed to setManifestKeyPrefix "${manifestKeyPrefix}" starts with "/". This is allowed, but since the key prefix does not normally start with a "/", you may have just changed the prefix accidentally.`);
        }

        // guarantee a single trailing slash, except for blank strings
        if (manifestKeyPrefix !== '') {
            manifestKeyPrefix = manifestKeyPrefix.replace(/\/$/, '');
            manifestKeyPrefix = manifestKeyPrefix + '/';
        }

        this.manifestKeyPrefix = manifestKeyPrefix;
    }

    configureDefinePlugin(definePluginOptionsCallback = () => {}) {
        if (typeof definePluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureDefinePlugin() must be a callback function');
        }

        this.definePluginOptionsCallback = definePluginOptionsCallback;
    }

    configureExtractTextPlugin(extractTextPluginOptionsCallback = () => {}) {
        if (typeof extractTextPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureExtractTextPlugin() must be a callback function');
        }

        this.extractTextPluginOptionsCallback = extractTextPluginOptionsCallback;
    }

    configureFriendlyErrorsPlugin(friendlyErrorsPluginOptionsCallback = () => {}) {
        if (typeof friendlyErrorsPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureFriendlyErrorsPlugin() must be a callback function');
        }

        this.friendlyErrorsPluginOptionsCallback = friendlyErrorsPluginOptionsCallback;
    }

    configureLoaderOptionsPlugin(loaderOptionsPluginOptionsCallback = () => {}) {
        if (typeof loaderOptionsPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureLoaderOptionsPlugin() must be a callback function');
        }

        this.loaderOptionsPluginOptionsCallback = loaderOptionsPluginOptionsCallback;
    }

    configureManifestPlugin(manifestPluginOptionsCallback = () => {}) {
        if (typeof manifestPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureManifestPlugin() must be a callback function');
        }

        this.manifestPluginOptionsCallback = manifestPluginOptionsCallback;
    }

    configureUglifyJsPlugin(uglifyJsPluginOptionsCallback = () => {}) {
        if (typeof uglifyJsPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureUglifyJsPlugin() must be a callback function');
        }

        this.uglifyJsPluginOptionsCallback = uglifyJsPluginOptionsCallback;
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

    addPlugin(plugin, priority = 0) {
        if (typeof priority !== 'number') {
            throw new Error('Argument 2 to addPlugin() must be a number.');
        }

        this.plugins.push({
            plugin: plugin,
            priority: priority
        });
    }

    addLoader(loader) {
        this.loaders.push(loader);
    }

    addAliases(aliases = {}) {
        if (typeof aliases !== 'object') {
            throw new Error('Argument 1 to addAliases() must be an object.');
        }

        Object.assign(this.aliases, aliases);
    }

    addExternals(externals = {}) {
        if (typeof externals !== 'object') {
            throw new Error('Argument 1 to addExternals() must be an object.');
        }

        Object.assign(this.externals, externals);
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
            let normalizedOptionKey = optionKey;
            if (optionKey === 'resolve_url_loader') {
                logger.deprecation('enableSassLoader: "resolve_url_loader" is deprecated. Please use "resolveUrlLoader" instead.');
                normalizedOptionKey = 'resolveUrlLoader';
            }

            if (!(normalizedOptionKey in this.sassOptions)) {
                throw new Error(`Invalid option "${normalizedOptionKey}" passed to enableSassLoader(). Valid keys are ${Object.keys(this.sassOptions).join(', ')}`);
            }

            this.sassOptions[normalizedOptionKey] = options[optionKey];
        }
    }

    enableLessLoader(lessLoaderOptionsCallback = () => {}) {
        this.useLessLoader = true;

        if (typeof lessLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableLessLoader() must be a callback function.');
        }

        this.lessLoaderOptionsCallback = lessLoaderOptionsCallback;
    }

    enableStylusLoader(stylusLoaderOptionsCallback = () => {}) {
        this.useStylusLoader = true;

        if (typeof stylusLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableStylusLoader() must be a callback function.');
        }

        this.stylusLoaderOptionsCallback = stylusLoaderOptionsCallback;
    }

    enableReactPreset() {
        this.useReact = true;
    }

    enablePreactPreset(options = {}) {
        this.usePreact = true;

        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.preactOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to enablePreactPreset(). Valid keys are ${Object.keys(this.preactOptions).join(', ')}`);
            }

            this.preactOptions[optionKey] = options[optionKey];
        }
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

    enableCoffeeScriptLoader(callback = () => {}) {
        this.useCoffeeScriptLoader = true;

        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to enableCoffeeScriptLoader() must be a callback function.');
        }

        this.coffeeScriptConfigurationCallback = callback;
    }

    enableVueLoader(vueLoaderOptionsCallback = () => {}) {
        this.useVueLoader = true;

        if (typeof vueLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableVueLoader() must be a callback function.');
        }

        this.vueLoaderOptionsCallback = vueLoaderOptionsCallback;
    }

    enableBuildNotifications(enabled = true, notifierPluginOptionsCallback = () => {}) {
        if (typeof notifierPluginOptionsCallback !== 'function') {
            throw new Error('Argument 2 to enableBuildNotifications() must be a callback function.');
        }

        this.useWebpackNotifier = enabled;
        this.notifierPluginOptionsCallback = notifierPluginOptionsCallback;
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

    configureUrlLoader(urlLoaderOptions = {}) {
        if (typeof urlLoaderOptions !== 'object') {
            throw new Error('Argument 1 to configureUrlLoader() must be an object.');
        }

        // Check allowed keys
        const validKeys = ['images', 'fonts'];
        for (const key of Object.keys(urlLoaderOptions)) {
            if (validKeys.indexOf(key) === -1) {
                throw new Error(`"${key}" is not a valid key for configureUrlLoader(). Valid keys: ${validKeys.join(', ')}.`);
            }
        }

        this.urlLoaderOptions = urlLoaderOptions;
    }

    cleanupOutputBeforeBuild(paths = ['**/*'], cleanWebpackPluginOptionsCallback = () => {}) {
        if (!Array.isArray(paths)) {
            throw new Error('Argument 1 to cleanupOutputBeforeBuild() must be an Array of paths - e.g. [\'**/*\']');
        }

        if (typeof cleanWebpackPluginOptionsCallback !== 'function') {
            throw new Error('Argument 2 to cleanupOutputBeforeBuild() must be a callback function');
        }

        this.cleanupOutput = true;
        this.cleanWebpackPluginPaths = paths;
        this.cleanWebpackPluginOptionsCallback = cleanWebpackPluginOptionsCallback;
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

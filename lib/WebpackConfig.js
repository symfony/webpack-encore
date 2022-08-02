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
const crypto = require('crypto');
const RuntimeConfig = require('./config/RuntimeConfig'); //eslint-disable-line no-unused-vars
const logger = require('./logger');
const regexpEscaper = require('./utils/regexp-escaper');
const { calculateDevServerUrl } = require('./config/path-util');

/**
 * @param {RuntimeConfig|null} runtimeConfig
 * @return {void}
 */
function validateRuntimeConfig(runtimeConfig) {
    // if you're using the encore executable, these things should never happen
    if (null === runtimeConfig) {
        throw new Error('RuntimeConfig must be initialized');
    }

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

        if (runtimeConfig.verbose) {
            logger.verbose();
        }

        this.runtimeConfig = runtimeConfig;
        this.entries = new Map();
        this.styleEntries = new Map();
        this.plugins = [];
        this.loaders = [];

        // Global settings
        this.outputPath = null;
        this.publicPath = null;
        this.manifestKeyPrefix = null;
        this.cacheGroups = {};
        this.providedVariables = {};
        this.configuredFilenames = {};
        this.aliases = {};
        this.externals = [];
        this.integrityAlgorithms = [];
        this.shouldUseSingleRuntimeChunk = null;
        this.shouldSplitEntryChunks = false;

        // Features/Loaders flags
        this.useVersioning = false;
        this.useSourceMaps = false;
        this.cleanupOutput = false;
        this.usePersistentCache = false;
        this.extractCss = true;
        this.imageRuleOptions = {
            type: 'asset/resource',
            maxSize: null,
            filename: 'images/[name].[hash:8][ext]',
            enabled: true,
        };
        this.fontRuleOptions = {
            type: 'asset/resource',
            maxSize: null,
            filename: 'fonts/[name].[hash:8][ext]',
            enabled: true,
        };
        this.usePostCssLoader = false;
        this.useLessLoader = false;
        this.useStylusLoader = false;
        this.useSassLoader = false;
        this.useStimulusBridge = false;
        this.useReact = false;
        this.usePreact = false;
        this.useVueLoader = false;
        this.useEslintPlugin = false;
        this.useTypeScriptLoader = false;
        this.useForkedTypeScriptTypeChecking = false;
        this.useBabelTypeScriptPreset = false;
        this.useWebpackNotifier = false;
        this.useHandlebarsLoader = false;

        // Features/Loaders options
        this.copyFilesConfigs = [];
        this.sassOptions = {
            resolveUrlLoader: true,
            resolveUrlLoaderOptions: {}
        };
        this.preactOptions = {
            preactCompat: false
        };
        this.babelOptions = {
            exclude: /(node_modules|bower_components)/,
            useBuiltIns: false,
            corejs: null,
        };
        this.babelTypeScriptPresetOptions = {};
        this.vueOptions = {
            useJsx: false,
            version: null,
            runtimeCompilerBuild: null
        };
        this.persistentCacheBuildDependencies = {};

        // Features/Loaders options callbacks
        this.imageRuleCallback = () => {};
        this.fontRuleCallback = () => {};
        this.postCssLoaderOptionsCallback = () => {};
        this.sassLoaderOptionsCallback = () => {};
        this.lessLoaderOptionsCallback = () => {};
        this.stylusLoaderOptionsCallback = () => {};
        this.babelConfigurationCallback = () => {};
        this.babelPresetEnvOptionsCallback = () => {};
        this.cssLoaderConfigurationCallback = () => {};
        this.styleLoaderConfigurationCallback = () => {};
        this.splitChunksConfigurationCallback = () => {};
        this.watchOptionsConfigurationCallback = () => {};
        this.devServerOptionsConfigurationCallback = () => {};
        this.vueLoaderOptionsCallback = () => {};
        this.eslintPluginOptionsCallback = () => {};
        this.tsConfigurationCallback = () => {};
        this.handlebarsConfigurationCallback = () => {};
        this.miniCssExtractLoaderConfigurationCallback = () => {};
        this.miniCssExtractPluginConfigurationCallback = () => {};
        this.loaderConfigurationCallbacks = {
            javascript: () => {},
            css: () => {},
            images: () => {},
            fonts: () => {},
            sass: () => {},
            less: () => {},
            stylus: () => {},
            vue: () => {},
            eslint: () => {},
            typescript: () => {},
            handlebars: () => {},
        };

        // Plugins options
        this.cleanWebpackPluginPaths = ['**/*'];

        // Plugins callbacks
        this.cleanWebpackPluginOptionsCallback = () => {};
        this.definePluginOptionsCallback = () => {};
        this.forkedTypeScriptTypesCheckOptionsCallback = () => {};
        this.friendlyErrorsPluginOptionsCallback = () => {};
        this.manifestPluginOptionsCallback = () => {};
        this.terserPluginOptionsCallback = () => {};
        this.cssMinimizerPluginOptionsCallback = () => {};
        this.notifierPluginOptionsCallback = () => {};
        this.persistentCacheCallback = () => {};
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
            // If the parent of the output directory does not exist either
            // check if it is located under the context directory before
            // creating it and its parent.
            const parentPath = path.dirname(outputPath);
            if (!fs.existsSync(parentPath)) {
                const context = path.resolve(this.getContext());
                if (outputPath.indexOf(context) !== 0) {
                    throw new Error(`outputPath directory "${outputPath}" does not exist and is not located under the context directory "${context}". Please check the path you're passing to setOutputPath() or create this directory.`);
                }

                parentPath.split(path.sep).reduce((previousPath, directory) => {
                    const newPath = path.resolve(previousPath, directory);
                    if (!fs.existsSync(newPath)) {
                        fs.mkdirSync(newPath);
                    }
                    return newPath;
                }, path.sep);
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

    configureFriendlyErrorsPlugin(friendlyErrorsPluginOptionsCallback = () => {}) {
        if (typeof friendlyErrorsPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureFriendlyErrorsPlugin() must be a callback function');
        }

        this.friendlyErrorsPluginOptionsCallback = friendlyErrorsPluginOptionsCallback;
    }

    configureManifestPlugin(manifestPluginOptionsCallback = () => {}) {
        if (typeof manifestPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureManifestPlugin() must be a callback function');
        }

        this.manifestPluginOptionsCallback = manifestPluginOptionsCallback;
    }

    configureTerserPlugin(terserPluginOptionsCallback = () => {}) {
        if (typeof terserPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureTerserPlugin() must be a callback function');
        }

        this.terserPluginOptionsCallback = terserPluginOptionsCallback;
    }

    configureCssMinimizerPlugin(cssMinimizerPluginOptionsCallback = () => {}) {
        if (typeof cssMinimizerPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureCssMinimizerPlugin() must be a callback function');
        }

        this.cssMinimizerPluginOptionsCallback = cssMinimizerPluginOptionsCallback;
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

        const devServerUrl = calculateDevServerUrl(this.runtimeConfig);

        // if using dev-server, prefix the publicPath with the dev server URL
        return devServerUrl.replace(/\/$/,'') + this.publicPath;
    }

    addEntry(name, src) {
        this.validateNameIsNewEntry(name);

        this.entries.set(name, src);
    }

    /**
     * Provide a has of entries at once, as an alternative to calling `addEntry` several times.
     *
     * @param {Object.<string, string|string[]>} entries
     * @returns {Void}
     */
    addEntries(entries = {}) {
        if (typeof entries !== 'object') {
            throw new Error('Argument 1 to addEntries() must be an object.');
        }

        Object.entries(entries).forEach((entry) => this.addEntry(entry[0], entry[1]));
    }

    addStyleEntry(name, src) {
        this.validateNameIsNewEntry(name);

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

    addExternals(externals = []) {
        if (!Array.isArray(externals)) {
            externals = [externals];
        }

        this.externals = this.externals.concat(externals);
    }

    enableVersioning(enabled = true) {
        this.useVersioning = enabled;
    }

    enableSourceMaps(enabled = true) {
        this.useSourceMaps = enabled;
    }

    configureBabel(callback, options = {}) {
        if (callback) {
            if (typeof callback !== 'function') {
                throw new Error('Argument 1 to configureBabel() must be a callback function or null.');
            }

            if (this.doesBabelRcFileExist()) {
                throw new Error('The "callback" argument of configureBabel() will not be used because your app already provides an external Babel configuration (e.g. a ".babelrc" or "babel.config.js" file or "babel" key in "package.json"). Use null as the first argument to remove this error.');
            }
        }

        this.babelConfigurationCallback = callback || (() => {});

        // Whitelist some options that can be used even if there
        // is an external Babel config. The other ones won't be
        // applied and a warning message will be displayed instead.
        const allowedOptionsWithExternalConfig = ['includeNodeModules', 'exclude'];

        for (const optionKey of Object.keys(options)) {
            if (this.doesBabelRcFileExist() && !allowedOptionsWithExternalConfig.includes(optionKey)) {
                logger.warning(`The "${optionKey}" option of configureBabel() will not be used because your app already provides an external Babel configuration (e.g. a ".babelrc" or "babelrc.config.js" file or "babel" key in "package.json").`);
                continue;
            }

            if (optionKey === 'includeNodeModules') {
                if (Object.keys(options).includes('exclude')) {
                    throw new Error('"includeNodeModules" and "exclude" options can\'t be used together when calling configureBabel().');
                }

                if (!Array.isArray(options[optionKey])) {
                    throw new Error('Option "includeNodeModules" passed to configureBabel() must be an Array.');
                }

                this.babelOptions['exclude'] = (filePath) => {
                    // Don't exclude modules outside of node_modules/bower_components
                    if (!/(node_modules|bower_components)/.test(filePath)) {
                        return false;
                    }

                    // Don't exclude whitelisted Node modules
                    const whitelistedModules = options[optionKey].map(
                        module => path.join('node_modules', module) + path.sep
                    );

                    for (const modulePath of whitelistedModules) {
                        if (filePath.includes(modulePath)) {
                            return false;
                        }
                    }

                    // Exclude other modules
                    return true;
                };
            } else if (!(optionKey in this.babelOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to configureBabel(). Valid keys are ${[...Object.keys(this.babelOptions), 'includeNodeModules'].join(', ')}`);
            } else {
                this.babelOptions[optionKey] = options[optionKey];
            }
        }
    }

    configureBabelPresetEnv(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureBabelPresetEnv() must be a callback function.');
        }

        if (this.doesBabelRcFileExist()) {
            throw new Error('The "callback" argument of configureBabelPresetEnv() will not be used because your app already provides an external Babel configuration (e.g. a ".babelrc" or "babel.config.js" file or "babel" key in "package.json").');
        }

        this.babelPresetEnvOptionsCallback = callback;
    }

    configureCssLoader(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureCssLoader() must be a callback function.');
        }

        this.cssLoaderConfigurationCallback = callback;
    }

    configureStyleLoader(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureStyleLoader() must be a callback function.');
        }

        this.styleLoaderConfigurationCallback = callback;
    }

    configureMiniCssExtractPlugin(loaderOptionsCallback, pluginOptionsCallback = () => {}) {
        if (typeof loaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureMiniCssExtractPluginLoader() must be a callback function.');
        }

        if (typeof pluginOptionsCallback !== 'function') {
            throw new Error('Argument 2 to configureMiniCssExtractPluginLoader() must be a callback function.');
        }

        this.miniCssExtractLoaderConfigurationCallback = loaderOptionsCallback;
        this.miniCssExtractPluginConfigurationCallback = pluginOptionsCallback;
    }

    enableSingleRuntimeChunk() {
        this.shouldUseSingleRuntimeChunk = true;
    }

    disableSingleRuntimeChunk() {
        this.shouldUseSingleRuntimeChunk = false;
    }

    splitEntryChunks() {
        this.shouldSplitEntryChunks = true;
    }

    configureSplitChunks(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureSplitChunks() must be a callback function.');
        }

        this.splitChunksConfigurationCallback = callback;
    }

    configureWatchOptions(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureWatchOptions() must be a callback function.');
        }

        this.watchOptionsConfigurationCallback = callback;
    }

    configureDevServerOptions(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureDevServerOptions() must be a callback function.');
        }

        this.devServerOptionsConfigurationCallback = callback;
    }

    addCacheGroup(name, options) {
        if (typeof name !== 'string') {
            throw new Error('Argument 1 to addCacheGroup() must be a string.');
        }

        if (typeof options !== 'object') {
            throw new Error('Argument 2 to addCacheGroup() must be an object.');
        }

        if (!options['test'] && !options['node_modules']) {
            throw new Error('Either the "test" option or the "node_modules" option of addCacheGroup() must be set');
        }

        if (options['node_modules']) {
            if (!Array.isArray(options['node_modules'])) {
                throw new Error('The "node_modules" option of addCacheGroup() must be an array');
            }

            options.test = new RegExp(`[\\\\/]node_modules[\\\\/](${
                options['node_modules']
                    .map(regexpEscaper)
                    .join('|')
            })[\\\\/]`);

            delete options['node_modules'];
        }

        this.cacheGroups[name] = options;
    }

    copyFiles(configs = []) {
        if (!Array.isArray(configs)) {
            configs = [configs];
        }

        if (configs.some(elt => typeof elt !== 'object')) {
            throw new Error('copyFiles() must be called with either a config object or an array of config objects.');
        }

        const defaultConfig = {
            from: null,
            pattern: /.*/,
            to: null,
            includeSubdirectories: true,
            context: null,
        };

        for (const config of configs) {
            if (!config.from) {
                throw new Error('Config objects passed to copyFiles() must have a "from" property.');
            }

            for (const configKey of Object.keys(config)) {
                if (!(configKey in defaultConfig)) {
                    throw new Error(`Invalid config option "${configKey}" passed to copyFiles(). Valid keys are ${Object.keys(defaultConfig).join(', ')}`);
                }
            }

            if (typeof config.pattern !== 'undefined' && !(config.pattern instanceof RegExp)) {
                let validPattern = false;
                if (typeof config.pattern === 'string') {
                    const regexPattern = /^\/(.*)\/([a-z]*)?$/;
                    if (regexPattern.test(config.pattern)) {
                        validPattern = true;
                    }
                }

                if (!validPattern) {
                    throw new Error(`Invalid pattern "${config.pattern}" passed to copyFiles(). Make sure it contains a valid regular expression.`);
                }
            }

            this.copyFilesConfigs.push(
                Object.assign({}, defaultConfig, config)
            );
        }
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

    enableStylusLoader(stylusLoaderOptionsCallback = () => {}) {
        this.useStylusLoader = true;

        if (typeof stylusLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableStylusLoader() must be a callback function.');
        }

        this.stylusLoaderOptionsCallback = stylusLoaderOptionsCallback;
    }

    enableStimulusBridge(controllerJsonPath) {
        this.useStimulusBridge = true;

        if (!fs.existsSync(controllerJsonPath)) {
            throw new Error(`File "${controllerJsonPath}" could not be found.`);
        }

        // Add configured entrypoints
        const controllersData = JSON.parse(fs.readFileSync(controllerJsonPath));
        const rootDir = path.dirname(path.resolve(controllerJsonPath));

        for (let name in controllersData.entrypoints) {
            this.addEntry(name, rootDir + '/' + controllersData.entrypoints[name]);
        }

        this.addAliases({
            '@symfony/stimulus-bridge/controllers.json': path.resolve(controllerJsonPath),
        });
    }

    enableBuildCache(buildDependencies, callback = (cache) => {}) {
        if (typeof buildDependencies !== 'object') {
            throw new Error('Argument 1 to enableBuildCache() must be an object.');
        }

        if (!buildDependencies.config) {
            throw new Error('Argument 1 to enableBuildCache() should contain an object with at least a "config" key. See the documentation for this method.');
        }

        this.usePersistentCache = true;
        this.persistentCacheBuildDependencies = buildDependencies;

        if (typeof callback !== 'function') {
            throw new Error('Argument 2 to enableBuildCache() must be a callback function.');
        }

        this.persistentCacheCallback = callback;
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
        if (this.useBabelTypeScriptPreset) {
            throw new Error('Encore.enableTypeScriptLoader() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        }

        this.useTypeScriptLoader = true;

        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to enableTypeScriptLoader() must be a callback function.');
        }

        this.tsConfigurationCallback = callback;
    }

    enableForkedTypeScriptTypesChecking(forkedTypeScriptTypesCheckOptionsCallback = () => {}) {
        if (this.useBabelTypeScriptPreset) {
            throw new Error('Encore.enableForkedTypeScriptTypesChecking() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        }

        if (typeof forkedTypeScriptTypesCheckOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableForkedTypeScriptTypesChecking() must be a callback function.');
        }

        this.useForkedTypeScriptTypeChecking = true;
        this.forkedTypeScriptTypesCheckOptionsCallback =
            forkedTypeScriptTypesCheckOptionsCallback;
    }

    enableBabelTypeScriptPreset(options = {}) {
        if (this.useTypeScriptLoader) {
            throw new Error('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableTypeScriptLoader() has been called.');
        }

        if (this.useForkedTypeScriptTypeChecking) {
            throw new Error('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableForkedTypeScriptTypesChecking() has been called.');
        }

        this.useBabelTypeScriptPreset = true;
        this.babelTypeScriptPresetOptions = options;
    }

    enableVueLoader(vueLoaderOptionsCallback = () => {}, vueOptions = {}) {
        this.useVueLoader = true;

        if (typeof vueLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableVueLoader() must be a callback function.');
        }

        this.vueLoaderOptionsCallback = vueLoaderOptionsCallback;

        // Check allowed keys
        for (const key of Object.keys(vueOptions)) {
            if (!(key in this.vueOptions)) {
                throw new Error(`"${key}" is not a valid key for enableVueLoader(). Valid keys: ${Object.keys(this.vueOptions).join(', ')}.`);
            }

            if (key === 'version') {
                const validVersions = [2, 3];
                if (!validVersions.includes(vueOptions.version)) {
                    throw new Error(`"${vueOptions.version}" is not a valid value for the "version" option passed to enableVueLoader(). Valid versions are: ${validVersions.join(', ')}.`);
                }
            }

            this.vueOptions[key] = vueOptions[key];
        }

        // useJsx and vue 3 are not currently supported by Encore
        if (this.vueOptions.useJsx && this.vueOptions.version === 3) {
            throw new Error('Setting both "useJsx: true" and "version: 3" for enableVueLoader() is not currently supported. Please use version: 2 or disable useJsx.');
        }
    }

    enableEslintPlugin(eslintPluginOptionsOrCallback = () => {}) {
        this.useEslintPlugin = true;

        if (typeof eslintPluginOptionsOrCallback === 'function') {
            this.eslintPluginOptionsCallback = eslintPluginOptionsOrCallback;
        } else if (typeof eslintPluginOptionsOrCallback === 'object') {
            this.eslintPluginOptionsCallback = (options) => {
                Object.assign(options, eslintPluginOptionsOrCallback);
            };
        } else {
            throw new Error('Argument 1 to enableEslintPlugin() must be either an object or callback function.');
        }
    }

    enableBuildNotifications(enabled = true, notifierPluginOptionsCallback = () => {}) {
        if (typeof notifierPluginOptionsCallback !== 'function') {
            throw new Error('Argument 2 to enableBuildNotifications() must be a callback function.');
        }

        this.useWebpackNotifier = enabled;
        this.notifierPluginOptionsCallback = notifierPluginOptionsCallback;
    }

    enableHandlebarsLoader(callback = () => {}) {
        this.useHandlebarsLoader = true;

        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to enableHandlebarsLoader() must be a callback function.');
        }

        this.handlebarsConfigurationCallback = callback;
    }

    disableCssExtraction(disabled = true) {
        this.extractCss = !disabled;
    }

    configureFilenames(configuredFilenames = {}) {
        if (typeof configuredFilenames !== 'object') {
            throw new Error('Argument 1 to configureFilenames() must be an object.');
        }

        // Check allowed keys
        const validKeys = ['js', 'css', 'assets'];
        for (const key of Object.keys(configuredFilenames)) {
            if (!validKeys.includes(key)) {
                throw new Error(`"${key}" is not a valid key for configureFilenames(). Valid keys: ${validKeys.join(', ')}. Use configureImageRule() or configureFontRule() to control image or font filenames.`);
            }
        }

        this.configuredFilenames = configuredFilenames;
    }

    configureImageRule(options = {}, ruleCallback = () => {}) {
        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.imageRuleOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to configureImageRule(). Valid keys are ${Object.keys(this.imageRuleOptions).join(', ')}`);
            }

            this.imageRuleOptions[optionKey] = options[optionKey];
        }

        if (this.imageRuleOptions.maxSize && this.imageRuleOptions.type !== 'asset') {
            throw new Error('Invalid option "maxSize" passed to configureImageRule(): this option is only valid when "type" is set to "asset".');
        }

        if (typeof ruleCallback !== 'function') {
            throw new Error('Argument 2 to configureImageRule() must be a callback function.');
        }

        this.imageRuleCallback = ruleCallback;
    }

    configureFontRule(options = {}, ruleCallback = () => {}) {
        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.fontRuleOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to configureFontRule(). Valid keys are ${Object.keys(this.fontRuleOptions).join(', ')}`);
            }

            this.fontRuleOptions[optionKey] = options[optionKey];
        }

        if (this.fontRuleOptions.maxSize && this.fontRuleOptions.type !== 'asset') {
            throw new Error('Invalid option "maxSize" passed to configureFontRule(): this option is only valid when "type" is set to "asset".');
        }

        if (typeof ruleCallback !== 'function') {
            throw new Error('Argument 2 to configureFontRule() must be a callback function.');
        }

        this.fontRuleCallback = ruleCallback;
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

    configureLoaderRule(name, callback) {
        logger.warning('Be careful when using Encore.configureLoaderRule(), this is a low-level method that can potentially break Encore and Webpack when not used carefully.');

        // Key: alias, Value: existing loader in `this.loaderConfigurationCallbacks`
        const aliases = {
            js: 'javascript',
            ts: 'typescript',
            scss: 'sass',
        };

        if (name in aliases) {
            name = aliases[name];
        }

        if (!(name in this.loaderConfigurationCallbacks)) {
            throw new Error(`Loader "${name}" is not configurable. Valid loaders are "${Object.keys(this.loaderConfigurationCallbacks).join('", "')}" and the aliases "${Object.keys(aliases).join('", "')}".`);
        }

        if (typeof callback !== 'function') {
            throw new Error('Argument 2 to configureLoaderRule() must be a callback function.');
        }

        this.loaderConfigurationCallbacks[name] = callback;
    }

    enableIntegrityHashes(enabled = true, algorithms = ['sha384']) {
        if (!Array.isArray(algorithms)) {
            algorithms = [algorithms];
        }

        const availableHashes = crypto.getHashes();
        for (const algorithm of algorithms) {
            if (typeof algorithm !== 'string') {
                throw new Error('Argument 2 to enableIntegrityHashes() must be a string or an array of strings.');
            }

            if (!availableHashes.includes(algorithm)) {
                throw new Error(`Invalid hash algorithm "${algorithm}" passed to enableIntegrityHashes().`);
            }
        }

        this.integrityAlgorithms = enabled ? algorithms : [];
    }

    useDevServer() {
        return this.runtimeConfig.useDevServer;
    }

    isProduction() {
        return this.runtimeConfig.environment === 'production';
    }

    isDev() {
        return this.runtimeConfig.environment === 'dev';
    }

    isDevServer() {
        return this.isDev() && this.runtimeConfig.useDevServer;
    }

    validateNameIsNewEntry(name) {
        const entryNamesOverlapMsg = 'The entry names between addEntry(), addEntries(), and addStyleEntry() must be unique.';

        if (this.entries.has(name)) {
            throw new Error(`Duplicate name "${name}}" already exists as an Entrypoint. ${entryNamesOverlapMsg}`);
        }

        if (this.styleEntries.has(name)) {
            throw new Error(`The "${name}" already exists as a Style Entrypoint. ${entryNamesOverlapMsg}`);
        }
    }
}

module.exports = WebpackConfig;

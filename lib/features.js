/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const packageHelper = require('./package-helper');

/**
 * An object that holds internal configuration about different
 * "loaders"/"plugins" that can be enabled/used.
 */
const features = {
    sass: {
        method: 'enableSassLoader()',
        packages: [
            { name: 'sass-loader', enforce_version: true },
            [{ name: 'sass' }, { name: 'sass-embedded' }, { name: 'node-sass' }]
        ],
        description: 'load Sass files'
    },
    less: {
        method: 'enableLessLoader()',
        packages: [
            { name: 'less-loader', enforce_version: true },
        ],
        description: 'load LESS files'
    },
    stylus: {
        method: 'enableStylusLoader()',
        packages: [
            { name: 'stylus-loader', enforce_version: true },
            { name: 'stylus' }
        ],
        description: 'load Stylus files'
    },
    postcss: {
        method: 'enablePostCssLoader()',
        packages: [
            { name: 'postcss-loader', enforce_version: true }
        ],
        description: 'process through PostCSS'
    },
    react: {
        method: 'enableReactPreset()',
        packages: [
            { name: '@babel/preset-react', enforce_version: true }
        ],
        description: 'process React JS files'
    },
    preact: {
        method: 'enablePreactPreset()',
        packages: [
            { name: '@babel/plugin-transform-react-jsx', enforce_version: true }
        ],
        description: 'process Preact JS files'
    },
    typescript: {
        method: 'enableTypeScriptLoader()',
        packages: [
            { name: 'typescript' },
            { name: 'ts-loader', enforce_version: true },
        ],
        description: 'process TypeScript files'
    },
    forkedtypecheck: {
        method: 'enableForkedTypeScriptTypesChecking()',
        packages: [
            { name: 'typescript' },
            { name: 'ts-loader', enforce_version: true },
            { name: 'fork-ts-checker-webpack-plugin', enforce_version: true },
        ],
        description: 'check TypeScript types in a separate process'
    },
    'typescript-babel': {
        method: 'enableBabelTypeScriptPreset',
        packages: [
            { name: 'typescript' },
            { name: '@babel/preset-typescript', enforce_version: true },
            { name: '@babel/plugin-proposal-class-properties', enforce_version: true },
        ],
        description: 'process TypeScript files with Babel'
    },
    vue2: {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // vue-template-compiler is a peer dep of vue-loader
        packages: [
            { name: 'vue', version: '^2.5' },
            { name: 'vue-loader', version: '^15.9.5' },
            { name: 'vue-template-compiler' }
        ],
        description: 'load Vue files'
    },
    'vue2.7': {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        packages: [
            { name: 'vue', version: '^2.7' },
            { name: 'vue-loader', version: '^15.10.0' },
        ],
        description: 'load Vue files'
    },
    vue3: {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // @vue/compiler-sfc is an optional peer dep of vue-loader
        packages: [
            { name: 'vue', enforce_version: true },
            { name: 'vue-loader', enforce_version: true },
            { name: '@vue/compiler-sfc' }
        ],
        description: 'load Vue files'
    },
    'vue-jsx': {
        method: 'enableVueLoader()',
        packages: [
            { name: '@vue/babel-preset-jsx' },
            { name: '@vue/babel-helper-vue-jsx-merge-props' }
        ],
        description: 'use Vue with JSX support'
    },
    eslint_plugin: {
        method: 'enableEslintPlugin()',
        // eslint is needed so the end-user can do things
        packages: [
            { name: 'eslint' },
            { name: 'eslint-webpack-plugin', enforce_version: true },
        ],
        description: 'Enable ESLint checks'
    },
    copy_files: {
        method: 'copyFiles()',
        packages: [
            { name: 'file-loader', enforce_version: true },
        ],
        description: 'Copy files'
    },
    notifier: {
        method: 'enableBuildNotifications()',
        packages: [
            { name: 'webpack-notifier', enforce_version: true },
        ],
        description: 'display build notifications'
    },
    handlebars: {
        method: 'enableHandlebarsLoader()',
        packages: [
            { name: 'handlebars' },
            { name: 'handlebars-loader', enforce_version: true }
        ],
        description: 'load Handlebars files'
    },
    stimulus: {
        method: 'enableStimulusBridge()',
        packages: [
            { name: '@symfony/stimulus-bridge', enforce_version: true }
        ],
        description: 'enable Stimulus bridge'
    }
};

function getFeatureConfig(featureName) {
    if (!features[featureName]) {
        throw new Error(`Unknown feature ${featureName}`);
    }

    return features[featureName];
}

module.exports = {
    ensurePackagesExistAndAreCorrectVersion: function(featureName) {
        const config = getFeatureConfig(featureName);

        packageHelper.ensurePackagesExist(
            packageHelper.addPackagesVersionConstraint(config.packages),
            config.method
        );
    },

    getMissingPackageRecommendations: function(featureName) {
        const config = getFeatureConfig(featureName);

        return packageHelper.getMissingPackageRecommendations(
            packageHelper.addPackagesVersionConstraint(config.packages),
            config.method
        );
    },

    getFeatureMethod: function(featureName) {
        return getFeatureConfig(featureName).method;
    },

    getFeatureDescription: function(featureName) {
        return getFeatureConfig(featureName).description;
    },
};

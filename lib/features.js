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
            // allow node-sass or sass to be installed
            [{ name: 'node-sass' }, { name: 'sass' }]
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
    vue: {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // vue-template-compiler is a peer dep of vue-loader
        packages: [
            { name: 'vue' },
            { name: 'vue-loader', enforce_version: true },
            { name: 'vue-template-compiler' }
        ],
        description: 'load VUE files'
    },
    'vue-jsx': {
        method: 'enableVueLoader()',
        packages: [
            { name: '@vue/babel-preset-jsx' },
            { name: '@vue/babel-helper-vue-jsx-merge-props' }
        ],
        description: 'use Vue with JSX support'
    },
    eslint: {
        method: 'enableEslintLoader()',
        // eslint is needed so the end-user can do things
        packages: [
            { name: 'eslint' },
            { name: 'eslint-loader', enforce_version: true },
            { name: 'babel-eslint', enforce_version: true },
        ],
        description: 'Enable ESLint checks'
    },
    notifier: {
        method: 'enableBuildNotifications()',
        packages: [
            { name: 'webpack-notifier', enforce_version: true },
        ],
        description: 'display build notifications'
    },
    urlloader: {
        method: 'configureUrlLoader()',
        packages: [
            { name: 'url-loader', enforce_version: true },
        ],
        description: 'use the url-loader'
    },
    handlebars: {
        method: 'enableHandlebarsLoader()',
        packages: [
            { name: 'handlebars' },
            { name: 'handlebars-loader', enforce_version: true }
        ],
        description: 'load Handlebars files'
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

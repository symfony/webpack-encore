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
            { name: 'sass-loader' },
            { name: 'node-sass' }
        ],
        description: 'load Sass files'
    },
    less: {
        method: 'enableLessLoader()',
        packages: [
            { name: 'less-loader' },
        ],
        description: 'load LESS files'
    },
    stylus: {
        method: 'enableStylusLoader()',
        packages: [
            { name: 'stylus-loader' },
            { name: 'stylus' }
        ],
        description: 'load Stylus files'
    },
    postcss: {
        method: 'enablePostCssLoader()',
        packages: [
            { name: 'postcss-loader' }
        ],
        description: 'process through PostCSS'
    },
    react: {
        method: 'enableReactPreset()',
        packages: [
            { name: '@babel/preset-react' }
        ],
        description: 'process React JS files'
    },
    preact: {
        method: 'enablePreactPreset()',
        packages: [
            { name: 'babel-plugin-transform-react-jsx' }
        ],
        description: 'process Preact JS files'
    },
    typescript: {
        method: 'enableTypeScriptLoader()',
        packages: [
            { name: 'typescript' },
            { name: 'ts-loader' },
        ],
        description: 'process TypeScript files'
    },
    forkedtypecheck: {
        method: 'enableForkedTypeScriptTypesChecking()',
        packages: [
            { name: 'typescript' },
            { name: 'ts-loader' },
            { name: 'fork-ts-checker-webpack-plugin' },
        ],
        description: 'check TypeScript types in a separate process'
    },
    vue: {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // vue-template-compiler is a peer dep of vue-loader
        packages: [
            { name: 'vue' },
            { name: 'vue-loader', version: 15 },
            { name: 'vue-template-compiler' }
        ],
        description: 'load VUE files'
    },
    eslint: {
        method: 'enableEslintLoader()',
        // eslint is needed so the end-user can do things
        packages: [
            { name: 'eslint' },
            { name: 'eslint-loader' },
            { name: 'babel-eslint' },
        ],
        description: 'Enable ESLint checks'
    },
    notifier: {
        method: 'enableBuildNotifications()',
        packages: [
            { name: 'webpack-notifier' },
        ],
        description: 'display build notifications'
    },
    urlloader: {
        method: 'configureUrlLoader()',
        packages: [
            { name: 'url-loader' },
        ],
        description: 'use the url-loader'
    },
    handlebars: {
        method: 'enableHandlebarsLoader()',
        packages: [
            { name: 'handlebars' },
            { name: 'handlebars-loader' }
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
    ensurePackagesExist: function(featureName) {
        const config = getFeatureConfig(featureName);

        packageHelper.ensurePackagesExist(
            config.packages,
            config.method
        );
    },

    getPackageRecommendations: function(featureName) {
        const config = getFeatureConfig(featureName);

        return packageHelper.getPackageRecommendations(
            config.packages,
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

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { PackagesConfig } from './package-helper.js';
import packageHelper from './package-helper.ts';

interface Feature {
    method: string;
    packages: PackagesConfig;
    description: string;
}

/**
 * An object that holds internal configuration about different
 * "loaders"/"plugins" that can be enabled/used.
 */
const features: Record<string, Feature> = {
    sass: {
        method: 'enableSassLoader()',
        packages: [
            { name: 'sass-loader', enforce_version: true },
            [{ name: 'sass' }, { name: 'sass-embedded' }, { name: 'node-sass' }],
        ],
        description: 'load Sass files',
    },
    less: {
        method: 'enableLessLoader()',
        packages: [{ name: 'less-loader', enforce_version: true }],
        description: 'load LESS files',
    },
    stylus: {
        method: 'enableStylusLoader()',
        packages: [{ name: 'stylus-loader', enforce_version: true }],
        description: 'load Stylus files',
    },
    postcss: {
        method: 'enablePostCssLoader()',
        packages: [{ name: 'postcss-loader', enforce_version: true }],
        description: 'process through PostCSS',
    },
    react: {
        method: 'enableReactPreset()',
        packages: [{ name: '@babel/preset-react', enforce_version: true }],
        description: 'process React JS files',
    },
    preact: {
        method: 'enablePreactPreset()',
        packages: [{ name: '@babel/plugin-transform-react-jsx', enforce_version: true }],
        description: 'process Preact JS files',
    },
    typescript: {
        method: 'enableTypeScriptLoader()',
        packages: [{ name: 'typescript' }, { name: 'ts-loader', enforce_version: true }],
        description: 'process TypeScript files',
    },
    forkedtypecheck: {
        method: 'enableForkedTypeScriptTypesChecking()',
        packages: [
            { name: 'typescript' },
            { name: 'ts-loader', enforce_version: true },
            { name: 'fork-ts-checker-webpack-plugin', enforce_version: true },
        ],
        description: 'check TypeScript types in a separate process',
    },
    'typescript-babel': {
        method: 'enableBabelTypeScriptPreset',
        packages: [
            { name: 'typescript' },
            { name: '@babel/preset-typescript', enforce_version: true },
        ],
        description: 'process TypeScript files with Babel',
    },
    vue3: {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // @vue/compiler-sfc is an optional peer dep of vue-loader
        packages: [
            { name: 'vue', enforce_version: true },
            { name: 'vue-loader', enforce_version: true },
            { name: '@vue/compiler-sfc' },
        ],
        description: 'load Vue files',
    },
    'vue3-jsx': {
        method: 'enableVueLoader()',
        packages: [{ name: '@vue/babel-plugin-jsx' }],
        description: 'use Vue with JSX support',
    },
    notifier: {
        method: 'enableBuildNotifications()',
        packages: [{ name: 'webpack-notifier', enforce_version: true }],
        description: 'display build notifications',
    },
    handlebars: {
        method: 'enableHandlebarsLoader()',
        packages: [{ name: 'handlebars' }, { name: 'handlebars-loader', enforce_version: true }],
        description: 'load Handlebars files',
    },
    stimulus: {
        method: 'enableStimulusBridge()',
        packages: [{ name: '@symfony/stimulus-bridge', enforce_version: true }],
        description: 'enable Stimulus bridge',
    },
    svelte: {
        method: 'enableSvelte()',
        packages: [
            { name: 'svelte', enforce_version: true },
            { name: 'svelte-loader', enforce_version: true },
        ],
        description: 'process Svelte JS files',
    },
    'webpack-dev-server': {
        method: 'configureDevServerOptions()',
        packages: [{ name: 'webpack-dev-server' }],
        description: 'run the Webpack development server',
    },
    'minify-js-esbuild': {
        method: 'configureJsMinimizerPlugin()',
        packages: [{ name: 'esbuild' }],
        description: 'minify JS with esbuild',
    },
    'minify-js-swc': {
        method: 'configureJsMinimizerPlugin()',
        packages: [{ name: '@swc/core' }],
        description: 'minify JS with SWC',
    },
    'minify-js-uglify': {
        method: 'configureJsMinimizerPlugin()',
        packages: [{ name: 'uglify-js' }],
        description: 'minify JS with UglifyJS',
    },
    'minify-css-lightningcss': {
        method: 'configureCssMinimizerPlugin()',
        packages: [{ name: 'lightningcss' }],
        description: 'minify CSS with Lightning CSS',
    },
    'minify-css-cssnano': {
        method: 'configureCssMinimizerPlugin()',
        packages: [{ name: 'cssnano' }, { name: 'postcss', enforce_version: true }],
        description: 'minify CSS with cssnano',
    },
    'minify-css-csso': {
        method: 'configureCssMinimizerPlugin()',
        packages: [{ name: 'csso' }],
        description: 'minify CSS with CSSO',
    },
    'minify-css-clean-css': {
        method: 'configureCssMinimizerPlugin()',
        packages: [{ name: 'clean-css' }],
        description: 'minify CSS with clean-css',
    },
    'minify-css-esbuild': {
        method: 'configureCssMinimizerPlugin()',
        packages: [{ name: 'esbuild' }],
        description: 'minify CSS with esbuild',
    },
    'minify-css-swc': {
        method: 'configureCssMinimizerPlugin()',
        packages: [{ name: '@swc/css' }],
        description: 'minify CSS with SWC',
    },
};

function getFeatureConfig(featureName: string): Feature {
    const config = features[featureName];
    if (!config) {
        throw new Error(`Unknown feature ${featureName}`);
    }

    return config;
}

export default {
    ensurePackagesExistAndAreCorrectVersion: function (
        featureName: string,
        method: string | null = null
    ): void {
        const config = getFeatureConfig(featureName);

        packageHelper.ensurePackagesExist(
            packageHelper.addPackagesVersionConstraint(config.packages),
            method || config.method
        );
    },

    getMissingPackageRecommendations: function (featureName: string) {
        const config = getFeatureConfig(featureName);

        return packageHelper.getMissingPackageRecommendations(
            packageHelper.addPackagesVersionConstraint(config.packages),
            config.method
        );
    },

    getFeatureMethod: function (featureName: string): string {
        return getFeatureConfig(featureName).method;
    },

    getFeatureDescription: function (featureName: string): string {
        return getFeatureConfig(featureName).description;
    },
};

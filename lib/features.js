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
        packages: ['sass-loader', 'node-sass'],
        description: 'load SASS files'
    },
    less: {
        method: 'enableLessLoader()',
        packages: ['less-loader'],
        description: 'load LESS files'
    },
    postcss: {
        method: 'enablePostCssLoader()',
        packages: ['postcss-loader'],
        description: 'process through PostCSS'
    },
    react: {
        method: 'enableReactPreset()',
        packages: ['babel-preset-react'],
        description: 'process React JS files'
    },
    typescript: {
        method: 'enableTypeScriptLoader()',
        packages: ['typescript', 'ts-loader'],
        description: 'process TypeScript files'
    },
    forkedtypecheck: {
        method: 'enableForkedTypeScriptTypesChecking()',
        packages: ['typescript', 'ts-loader', 'fork-ts-checker-webpack-plugin'],
        description: 'check TypeScript types in a separate process'
    },
    vue: {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // vue-template-compiler is a peer dep of vue-loader
        packages: ['vue', 'vue-loader', 'vue-template-compiler'],
        description: 'load VUE files'
    }
};

function getFeatureConfig(featureName) {
    if (!features[featureName]) {
        throw new Error(`Unknown feature ${featureName}`);
    }

    return features[featureName];
}

module.exports = {
    getFeatureConfig,

    ensurePackagesExist: function(featureName) {
        const config = getFeatureConfig(featureName);

        packageHelper.ensurePackagesExist(
            config.packages,
            config.method
        );
    },

    getFeatureMethod: function(featureName) {
        return getFeatureConfig(featureName).method;
    },

    getFeatureDescription: function(featureName) {
        return getFeatureConfig(featureName).description;
    }
};

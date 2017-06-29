/*
 * This file is part of the Symfony package.
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
 * "loaders" that can be enabled.
 */
const loaderFeatures = {
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
    vue: {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // vue-template-compiler is a peer dep of vue-loader
        packages: ['vue', 'vue-loader', 'vue-template-compiler'],
        description: 'load VUE files'
    }
};

function getLoaderFeatureConfig(loaderName) {
    if (!loaderFeatures[loaderName]) {
        throw new Error(`Unknown loader feature ${loaderName}`);
    }

    return loaderFeatures[loaderName];
}

module.exports = {
    getLoaderFeatureConfig,

    ensureLoaderPackagesExist: function(loaderName) {
        const config = getLoaderFeatureConfig(loaderName);

        packageHelper.ensurePackagesExist(
            config.packages,
            config.method
        );
    },

    getLoaderFeatureMethod: function(loaderName) {
        return getLoaderFeatureConfig(loaderName).method;
    },

    getLoaderFeatureDescription: function(loaderName) {
        return getLoaderFeatureConfig(loaderName).description;
    }
};

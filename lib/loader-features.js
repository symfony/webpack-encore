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

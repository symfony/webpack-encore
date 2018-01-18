/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderFeatures = require('../features');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Object} of options to use for eslint-loader options.
 */
module.exports = {
    getOptions(webpackConfig) {
        loaderFeatures.ensurePackagesExist('eslint');

        const eslintLoaderOptions = {
            parser: 'babel-eslint',
            emitWarning: true,
            'import/resolver': {
                webpack: {
                    config: 'webpack.config.js'
                }
            }
        };

        webpackConfig.eslintLoaderOptionsCallback.apply(
            // use eslintLoaderOptions as the this variable
            eslintLoaderOptions,
            [eslintLoaderOptions]
        );

        return eslintLoaderOptions;
    }
};

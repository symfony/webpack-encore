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
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Object} of options to use for eslint-loader options.
 */
module.exports = {
    getOptions(webpackConfig) {
        loaderFeatures.ensurePackagesExist('eslint');

        const eslintLoaderOptions = {
            cache: true,
            parser: 'babel-eslint',
            emitWarning: true,
            'import/resolver': {
                webpack: {
                    config: 'webpack.config.js'
                }
            }
        };

        return applyOptionsCallback(webpackConfig.eslintLoaderOptionsCallback, eslintLoaderOptions);
    }
};

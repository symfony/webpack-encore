/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const missingLoaderTransformer = require('../friendly-errors/transformers/missing-loader');
const missingLoaderFormatter = require('../friendly-errors/formatters/missing-loader');
const missingPostCssConfigTransformer = require('../friendly-errors/transformers/missing-postcss-config');
const missingPostCssConfigFormatter = require('../friendly-errors/formatters/missing-postcss-config');
const vueUnactivatedLoaderTransformer = require('../friendly-errors/transformers/vue-unactivated-loader-error');
const vueUnactivatedLoaderFormatter = require('../friendly-errors/formatters/vue-unactivated-loader-error');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {FriendlyErrorsWebpackPlugin}
 */
module.exports = function(webpackConfig) {
    const friendlyErrorsPluginOptions = {
        clearConsole: false,
        additionalTransformers: [
            missingLoaderTransformer,
            missingPostCssConfigTransformer,
            vueUnactivatedLoaderTransformer
        ],
        additionalFormatters: [
            missingLoaderFormatter,
            missingPostCssConfigFormatter,
            vueUnactivatedLoaderFormatter
        ],
        compilationSuccessInfo: {
            messages: []
        }
    };

    return new FriendlyErrorsWebpackPlugin(
        applyOptionsCallback(webpackConfig.friendlyErrorsPluginOptionsCallback, friendlyErrorsPluginOptions)
    );
};

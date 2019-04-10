/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const missingCssFileTransformer = require('../friendly-errors/transformers/missing-css-file');
const missingCssFileFormatter = require('../friendly-errors/formatters/missing-css-file');
const missingLoaderTransformer = require('../friendly-errors/transformers/missing-loader');
const missingLoaderFormatter = require('../friendly-errors/formatters/missing-loader');
const missingPostCssConfigTransformer = require('../friendly-errors/transformers/missing-postcss-config');
const missingPostCssConfigFormatter = require('../friendly-errors/formatters/missing-postcss-config');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {FriendlyErrorsWebpackPlugin}
 */
module.exports = function(webpackConfig) {
    const friendlyErrorsPluginOptions = {
        clearConsole: false,
        additionalTransformers: [
            missingCssFileTransformer,
            missingLoaderTransformer,
            missingPostCssConfigTransformer
        ],
        additionalFormatters: [
            missingCssFileFormatter,
            missingLoaderFormatter,
            missingPostCssConfigFormatter
        ],
        compilationSuccessInfo: {
            messages: []
        }
    };

    return new FriendlyErrorsWebpackPlugin(
        applyOptionsCallback(webpackConfig.friendlyErrorsPluginOptionsCallback, friendlyErrorsPluginOptions)
    );
};

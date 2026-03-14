/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @import WebpackConfig from '../WebpackConfig'
 */

import FriendlyErrorsWebpackPlugin from '@kocal/friendly-errors-webpack-plugin';
import missingCssFileTransformer from '../friendly-errors/transformers/missing-css-file.js';
import missingCssFileFormatter from '../friendly-errors/formatters/missing-css-file.js';
import missingLoaderTransformerFactory from '../friendly-errors/transformers/missing-loader.js';
import missingLoaderFormatter from '../friendly-errors/formatters/missing-loader.js';
import missingPostCssConfigTransformer from '../friendly-errors/transformers/missing-postcss-config.js';
import missingPostCssConfigFormatter from '../friendly-errors/formatters/missing-postcss-config.js';
import applyOptionsCallback from '../utils/apply-options-callback.js';

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {FriendlyErrorsWebpackPlugin}
 */
export default function(webpackConfig) {
    const friendlyErrorsPluginOptions = {
        clearConsole: false,
        additionalTransformers: [
            missingCssFileTransformer,
            missingLoaderTransformerFactory(webpackConfig),
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
}

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import FriendlyErrorsWebpackPlugin from '@kocal/friendly-errors-webpack-plugin';

import missingCssFileFormatter from '../friendly-errors/formatters/missing-css-file.ts';
import missingLoaderFormatter from '../friendly-errors/formatters/missing-loader.ts';
import missingPostCssConfigFormatter from '../friendly-errors/formatters/missing-postcss-config.ts';
import missingCssFileTransformer from '../friendly-errors/transformers/missing-css-file.ts';
import missingLoaderTransformerFactory from '../friendly-errors/transformers/missing-loader.ts';
import missingPostCssConfigTransformer from '../friendly-errors/transformers/missing-postcss-config.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.js';

export default function (webpackConfig: WebpackConfig) {
    const friendlyErrorsPluginOptions = {
        clearConsole: false,
        additionalTransformers: [
            missingCssFileTransformer,
            missingLoaderTransformerFactory(webpackConfig),
            missingPostCssConfigTransformer,
        ],
        additionalFormatters: [
            missingCssFileFormatter,
            missingLoaderFormatter,
            missingPostCssConfigFormatter,
        ],
        compilationSuccessInfo: {
            messages: [],
        },
    };

    return new FriendlyErrorsWebpackPlugin(
        applyOptionsCallback(
            webpackConfig.friendlyErrorsPluginOptionsCallback,
            friendlyErrorsPluginOptions
        )
    );
}

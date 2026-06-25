/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'url';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.js';

export default {
    /**
     * Prepends loaders with MiniCssExtractPlugin.loader
     */
    prependLoaders(webpackConfig: WebpackConfig, loaders: object[]) {
        if (!webpackConfig.extractCss) {
            const options = {};

            // If the CSS extraction is disabled, use the
            // style-loader instead.
            return [
                {
                    loader: fileURLToPath(import.meta.resolve('style-loader')),
                    options: applyOptionsCallback(
                        webpackConfig.styleLoaderConfigurationCallback,
                        options
                    ),
                },
                ...loaders,
            ];
        }

        return [
            {
                loader: MiniCssExtractPlugin.loader,
                options: applyOptionsCallback(
                    webpackConfig.miniCssExtractLoaderConfigurationCallback,
                    {}
                ),
            },
            ...loaders,
        ];
    },
};

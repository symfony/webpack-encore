/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @import WebpackConfig from '../WebpackConfig.js'
 */

import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.js';

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {object}
 */
export default function (webpackConfig) {
    const minimizerPluginOptions = {};

    return new CssMinimizerPlugin(
        applyOptionsCallback(
            webpackConfig.cssMinimizerPluginOptionsCallback,
            minimizerPluginOptions
        )
    );
}

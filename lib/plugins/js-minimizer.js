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

import MinimizerPlugin from 'minimizer-webpack-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.ts';
import { checkJsMinifierPackages } from '../utils/minifier-check.ts';

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {object}
 */
export default function (webpackConfig) {
    const minimizerPluginOptions = {
        parallel: true,
        minify: MinimizerPlugin.terserMinify,
    };

    const options = applyOptionsCallback(
        webpackConfig.minimizerPluginJsOptionsCallback,
        minimizerPluginOptions,
        MinimizerPlugin
    );

    checkJsMinifierPackages(options.minify);

    return new MinimizerPlugin(options);
}

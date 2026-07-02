/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import MinimizerPlugin from 'minimizer-webpack-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.js';
import { checkJsMinifierPackages } from '../utils/minifier-check.js';
import type WebpackConfig from '../WebpackConfig.js';

export default function (webpackConfig: WebpackConfig) {
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

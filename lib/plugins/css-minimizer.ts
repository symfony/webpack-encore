/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import MinimizerPlugin from 'minimizer-webpack-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.ts';
import { checkCssMinifierPackages } from '../utils/minifier-check.ts';
import type WebpackConfig from '../WebpackConfig.js';

export default function (webpackConfig: WebpackConfig) {
    const minimizerPluginOptions = {
        test: /\.css(\?.*)?$/i,
    };

    const options = applyOptionsCallback(
        webpackConfig.minimizerPluginCssOptionsCallback,
        minimizerPluginOptions,
        MinimizerPlugin
    );

    checkCssMinifierPackages(options.minify);

    return new MinimizerPlugin(options);
}

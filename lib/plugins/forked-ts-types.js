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

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.js';
import PluginPriorities from './plugin-priorities.js';

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {void}
 */
export default function (webpackConfig) {
    const config = {};

    webpackConfig.addPlugin(
        new ForkTsCheckerWebpackPlugin(
            applyOptionsCallback(webpackConfig.forkedTypeScriptTypesCheckOptionsCallback, config)
        ),
        PluginPriorities.ForkTsCheckerWebpackPlugin
    );
}

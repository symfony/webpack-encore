/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {object}
 */
module.exports = function(webpackConfig) {
    const optimizePluginOptions = {
        // see: https://github.com/NMFR/optimize-css-assets-webpack-plugin/issues/53#issuecomment-400294569
        // we always use annotations: true, which is the setting if you're
        // outputting to a separate file because this plugin is only
        // used in production, and, in production, we always use the
        // source-map option (a separate file) in config-generator.
        cssProcessorOptions: {
            map: {
                inline: false,
                annotation: true,
            }
        }
    };

    return new OptimizeCSSAssetsPlugin(
        applyOptionsCallback(webpackConfig.optimizeCssPluginOptionsCallback, optimizePluginOptions)
    );
};

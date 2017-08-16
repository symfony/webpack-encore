/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * Updates plugins array passed adding CleanWebpackPlugin instance
 *
 * @param {Array} plugins to push to
 * @param {WebpackConfig} webpackConfig read only variable
 * @param {Array} paths to clean
 * @param {Object} cleanUpOptions
 * @return {void}
 */
module.exports = function(plugins, webpackConfig, paths, cleanUpOptions = {}) {

    if (!webpackConfig.cleanupOutput) {
        return;
    }

    let config = Object.assign({}, cleanUpOptions, {
        root: webpackConfig.outputPath,
        verbose: false,
    });

    plugins.push(new CleanWebpackPlugin(paths, config));
};

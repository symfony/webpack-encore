/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * @param {WebpackConfig} webpackConfig
 * @param {Array} paths to clean
 * @param {Object} cleanUpOptions
 * @return {Array} of plugins to add to webpack
 */
module.exports = {
    getPlugins(webpackConfig, paths, cleanUpOptions = {}) {

        let config = Object.assign({}, cleanUpOptions, {
            root: webpackConfig.outputPath,
            verbose: false,
        });

        return [new CleanWebpackPlugin(paths, config)];
    }
};

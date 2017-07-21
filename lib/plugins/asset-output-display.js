/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const pathUtil = require('../config/path-util');
const AssetOutputDisplayPlugin = require('../friendly-errors/asset-output-display-plugin');
const FriendlyErrorsPlugin = require('./friendly-errors');

/**
 * @param {WebpackConfig} webpackConfig
 * @param {Array} paths to clean
 * @param {Object} cleanUpOptions
 * @return {Array} of plugins to add to webpack
 */
module.exports = {
    getPlugins(webpackConfig) {
        const outputPath = pathUtil.getRelativeOutputPath(webpackConfig);
        const friendlyErrorsPlugin = FriendlyErrorsPlugin.getPlugins();
        return [new AssetOutputDisplayPlugin(outputPath, friendlyErrorsPlugin[0])];
    }
};

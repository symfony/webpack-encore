/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

let ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**
 * @param {WebpackConfig} webpackConfig
 * @param {Array} paths to clean
 * @param {Object} forkedTsTypesOptions
 * @return {Array} of plugins to add to webpack
 */
module.exports = {
    getPlugins(webpackConfig) {
        let config = Object.assign({}, webpackConfig.forkedTypeScriptTypesCheckOptions);
        return [new ForkTsCheckerWebpackPlugin(config)];
    }
};

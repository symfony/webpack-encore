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
 * @return {void}
 */
module.exports = function(webpackConfig) {
    let config = Object.assign({}, webpackConfig.forkedTypeScriptTypesCheckOptions);
    webpackConfig.addPlugin(new ForkTsCheckerWebpackPlugin(config));
};

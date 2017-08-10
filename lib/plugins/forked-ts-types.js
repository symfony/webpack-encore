/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'); // eslint-disable-line

/**
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(webpackConfig) {
    let config = {};

    // allow for ts-loader config to be controlled
    webpackConfig.forkedTypeScriptTypesCheckOptionsCallback.apply(
        // use config as the this variable
        config,
        [config]
    );

    webpackConfig.addPlugin(new ForkTsCheckerWebpackPlugin(config));
};

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of plugins to add to webpack
 */
module.exports = {
    getPlugins(webpackConfig) {
        return [new webpack.ProvidePlugin(webpackConfig.providedVariables)];
    }
};

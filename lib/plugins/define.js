/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @param {Object} defineOptions
 * @return {void}
 */
module.exports = function(plugins, webpackConfig, defineOptions = {}) {

    if (!webpackConfig.isProduction()) {
        return;
    }

    let defineConfig = Object.assign({}, defineOptions, {
        'process.env': {
            NODE_ENV: '"production"'
        }
    });
    let define = new webpack.DefinePlugin(defineConfig);

    plugins.push(define);
};

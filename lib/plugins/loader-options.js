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
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {

    /*
     * This section is a bit mysterious. The "minimize"
     * true is read and used to minify the CSS.
     * But as soon as this plugin is included
     * at all, SASS begins to have errors, until the context
     * and output options are specified. At this time, I'm
     * not totally sure what's going on here
     * https://github.com/jtangelder/sass-loader/issues/285
     */
    plugins.push(new webpack.LoaderOptionsPlugin({
        debug: !webpackConfig.isProduction(),
        options: {
            context: webpackConfig.getContext(),
            output: { path: webpackConfig.outputPath }
        }
    }));
};

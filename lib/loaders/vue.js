/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderFeatures = require('../loader-features');
const cssLoaderUtil = require('./css');
const sassLoaderUtil = require('./sass');
const lessLoaderUtil = require('./less');
const babelLoaderUtil = require('./babel');
const extractText = require('./extract-text');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for Vue files
 */
module.exports = {
    getLoaders(webpackConfig, vueLoaderOptions) {
        loaderFeatures.ensureLoaderPackagesExist('vue');

        /*
         * The vue-loader passes the contents of <style> and <script>
         * through the loaders. The lang="" key tells vue-loader which
         * loader below to use (defaulting to css or js)
         */
        const loaders = {
            /*
             * Override the default js loader in vue-loader
             * so that it's able to receive our babel config
             */
            js: babelLoaderUtil.getLoaders(webpackConfig),

            /*
             * All of the style loaders are implemented by default by vue-loader,
             * because vue-loader automatically looks for a "LANG-loader"
             * and sets it up with sensible defaults.
             *
             * We're overriding those defaults so that we can use ExtractTextPlugin,
             * and also so that any other settings are kept (e.g. sourcemaps, or
             * SASS-specific processing options).
             *
             * We're also not adding the postcss-loader for each loader, because
             * this is added automatically by vue-loader.
             */
            css: extractText.extract(
                webpackConfig,
                cssLoaderUtil.getLoaders(webpackConfig, true),
                true
            ),

            /*
             * The optional loaders are always added here. Without these,
             * if the user forgets to enable an optional loader but uses
             * (for example) lang="scss" inside vue, it *will* work, becaus
             * vue-loader will automatically register the sass-loader. But,
             * it will completely skip our configuration (e.g. ExtractTextPlugin).
             */

            scss: extractText.extract(
                webpackConfig,
                sassLoaderUtil.getLoaders(webpackConfig, {}, true),
                true
            ),

            /*
             * indentedSyntax is required here for SASS. It's not required
             * when using the loaders normally, because the .sass extension
             * is detected and this option is activated automatically inside
             * sass-loader.
             */
            sass: extractText.extract(
                webpackConfig,
                sassLoaderUtil.getLoaders(
                    webpackConfig,
                    {
                        indentedSyntax: true
                    },
                    true
                ),
                true
            ),

            less: extractText.extract(
                webpackConfig,
                lessLoaderUtil.getLoaders(webpackConfig, true),
                true
            )
        };

        return [
            {
                loader: 'vue-loader',
                options: Object.assign({
                    loaders: loaders
                }, vueLoaderOptions)
            }
        ];
    }
};

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderFeatures = require('../features');
const cssLoaderUtil = require('./css');
const sassLoaderUtil = require('./sass');
const lessLoaderUtil = require('./less');
const babelLoaderUtil = require('./babel');
const extractText = require('./extract-text');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for Vue files
 */
module.exports = {
    getLoaders(webpackConfig) {
        loaderFeatures.ensurePackagesExist('vue');

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
        };

        if (webpackConfig.useSassLoader) {
            loaders.scss = extractText.extract(
                webpackConfig,
                sassLoaderUtil.getLoaders(webpackConfig, {}, true),
                true
            );

            /*
             * indentedSyntax is required here for SASS. It's not required
             * when using the loaders normally, because the .sass extension
             * is detected and this option is activated automatically inside
             * sass-loader.
             */
            loaders.sass = extractText.extract(
                webpackConfig,
                sassLoaderUtil.getLoaders(
                    webpackConfig,
                    {
                        indentedSyntax: true
                    },
                    true
                ),
                true
            );
        } else {
            loaders.scss = {
                loader: require.resolve('./vue-unactivated-loader'),
                options: {
                    lang: 'scss',
                    loaderName: 'sass-loader',
                    featureCommand: loaderFeatures.getFeatureMethod('sass')
                }
            };

            loaders.sass = {
                loader: require.resolve('./vue-unactivated-loader'),
                options: {
                    lang: 'sass',
                    loaderName: 'sass-loader',
                    featureCommand: loaderFeatures.getFeatureMethod('sass')
                }
            };
        }

        if (webpackConfig.useLessLoader) {
            loaders.less = extractText.extract(
                webpackConfig,
                lessLoaderUtil.getLoaders(webpackConfig, true),
                true
            );
        } else {
            loaders.less = {
                loader: require.resolve('./vue-unactivated-loader'),
                options: {
                    lang: 'less',
                    loaderName: 'less-loader',
                    featureCommand: loaderFeatures.getFeatureMethod('less')
                }
            };
        }

        const options = {
            loaders: loaders
        };

        return [
            {
                loader: 'vue-loader',
                options: applyOptionsCallback(webpackConfig.vueLoaderOptionsCallback, options)
            }
        ];
    }
};

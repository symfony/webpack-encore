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

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for Babel
 */
module.exports = {
    getLoaders(webpackConfig) {
        let babelConfig = {
            // improves performance by caching babel compiles
            // we add this option ALWAYS
            // https://github.com/babel/babel-loader#options
            cacheDirectory: true
        };

        // configure babel (unless the user is specifying .babelrc)
        // todo - add a sanity check for their babelrc contents
        if (!webpackConfig.doesBabelRcFileExist()) {
            Object.assign(babelConfig, {
                presets: [
                    ['env', {
                        // modules don't need to be transformed - webpack will parse
                        // the modules for us. This is a performance improvement
                        // https://babeljs.io/docs/plugins/preset-env/#optionsmodules
                        modules: false,
                        targets: {
                            browsers: '> 1%',
                            uglify: true
                        },
                        useBuiltIns: true
                    }]
                ],
                plugins: []
            });

            if (webpackConfig.useReact) {
                loaderFeatures.ensurePackagesExist('react');

                babelConfig.presets.push('react');
            }

            // allow for babel config to be controlled
            webpackConfig.babelConfigurationCallback.apply(
                // use babelConfig as the this variable
                babelConfig,
                [babelConfig]
            );
        }

        return [
            {
                loader: 'babel-loader',
                options: babelConfig
            }
        ];
    }
};

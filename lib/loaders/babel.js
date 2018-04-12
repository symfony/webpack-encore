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
const applyOptionsCallback = require('../utils/apply-options-callback');

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

            if (webpackConfig.usePreact) {
                loaderFeatures.ensurePackagesExist('preact');

                if (webpackConfig.preactOptions.preactCompat) {
                    // If preact-compat is enabled tell babel to
                    // transform JSX into React.createElement calls.
                    babelConfig.plugins.push(['transform-react-jsx']);
                } else {
                    // If preact-compat is disabled tell babel to
                    // transform JSX into Preact h() calls.
                    babelConfig.plugins.push([
                        'transform-react-jsx',
                        { 'pragma': 'h' }
                    ]);
                }
            }

            babelConfig = applyOptionsCallback(webpackConfig.babelConfigurationCallback, babelConfig);
        }

        return [
            {
                loader: 'babel-loader',
                options: babelConfig
            }
        ];
    }
};

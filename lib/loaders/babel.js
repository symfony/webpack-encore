/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const loaderFeatures = require('../features');
const applyOptionsCallback = require('../utils/apply-options-callback');

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @return {Array} of loaders to use for Babel
     */
    getLoaders(webpackConfig) {
        let babelConfig = {
            // improves performance by caching babel compiles
            // this option is always added but is set to FALSE in
            // production to avoid cache invalidation issues caused
            // by some Babel presets/plugins (for instance the ones
            // that use browserslist)
            // https://github.com/babel/babel-loader#options
            cacheDirectory: !webpackConfig.isProduction(),

            // let Babel guess which kind of import/export syntax
            // it should use based on the content of files
            sourceType: 'unambiguous',
        };

        // configure babel (unless the user is specifying .babelrc)
        // todo - add a sanity check for their babelrc contents
        if (!webpackConfig.doesBabelRcFileExist()) {
            let presetEnvOptions = {
                // modules don't need to be transformed - webpack will parse
                // the modules for us. This is a performance improvement
                // https://babeljs.io/docs/en/babel-preset-env#modules
                modules: false,
                targets: {},
                useBuiltIns: webpackConfig.babelOptions.useBuiltIns,
                corejs: webpackConfig.babelOptions.corejs,
            };

            presetEnvOptions = applyOptionsCallback(
                webpackConfig.babelPresetEnvOptionsCallback,
                presetEnvOptions
            );

            Object.assign(babelConfig, {
                presets: [
                    [require.resolve('@babel/preset-env'), presetEnvOptions]
                ],
                plugins: []
            });

            if (webpackConfig.useBabelTypeScriptPreset) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('typescript-babel');

                babelConfig.presets.push([require.resolve('@babel/preset-typescript'), webpackConfig.babelTypeScriptPresetOptions]);
            }

            if (webpackConfig.useReact) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('react');

                babelConfig.presets.push(require.resolve('@babel/preset-react'));
            }

            if (webpackConfig.usePreact) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('preact');

                if (webpackConfig.preactOptions.preactCompat) {
                    // If preact-compat is enabled tell babel to
                    // transform JSX into React.createElement calls.
                    babelConfig.plugins.push([require.resolve('@babel/plugin-transform-react-jsx')]);
                } else {
                    // If preact-compat is disabled tell babel to
                    // transform JSX into Preact h() calls.
                    babelConfig.plugins.push([
                        require.resolve('@babel/plugin-transform-react-jsx'),
                        { 'pragma': 'h' }
                    ]);
                }
            }

            if (webpackConfig.useVueLoader && webpackConfig.vueOptions.useJsx) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('vue-jsx');
                babelConfig.presets.push(require.resolve('@vue/babel-preset-jsx'));
            }

            babelConfig = applyOptionsCallback(webpackConfig.babelConfigurationCallback, babelConfig);
        }

        return [
            {
                loader: require.resolve('babel-loader'),
                options: babelConfig
            }
        ];
    },

    /**
     * @param {WebpackConfig} webpackConfig
     * @return {RegExp} to use for eslint-loader `test` rule
     */
    getTest(webpackConfig) {
        const extensions = [
            'm?jsx?', // match .js and .jsx and .mjs
        ];

        if (webpackConfig.useBabelTypeScriptPreset) {
            extensions.push('tsx?'); // match .ts and .tsx
        }

        return new RegExp(`\\.(${extensions.join('|')})$`);
    }
};

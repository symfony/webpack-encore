/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @import WebpackConfig from '../WebpackConfig.js'
 */

import { fileURLToPath } from 'url';

import loaderFeatures from '../features.js';
import applyOptionsCallback from '../utils/apply-options-callback.js';

export default {
    /**
     * @param {WebpackConfig} webpackConfig
     * @returns {Promise<Array>} of loaders to use for Babel
     */
    async getLoaders(webpackConfig) {
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
        if (!(await webpackConfig.doesBabelRcFileExist())) {
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
                    [fileURLToPath(import.meta.resolve('@babel/preset-env')), presetEnvOptions],
                ],
                plugins: [],
            });

            if (webpackConfig.useBabelTypeScriptPreset) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('typescript-babel');

                babelConfig.presets.push([
                    fileURLToPath(import.meta.resolve('@babel/preset-typescript')),
                    webpackConfig.babelTypeScriptPresetOptions,
                ]);
            }

            if (webpackConfig.useReact) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('react');

                babelConfig.presets.push([
                    fileURLToPath(import.meta.resolve('@babel/preset-react')),
                    applyOptionsCallback(webpackConfig.babelReactPresetOptionsCallback, {
                        // TODO: To remove when Babel 8, "automatic" will become the default value
                        runtime: 'automatic',
                    }),
                ]);
            }

            if (webpackConfig.usePreact) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('preact');

                if (webpackConfig.preactOptions.preactCompat) {
                    // If preact-compat is enabled tell babel to
                    // transform JSX into React.createElement calls.
                    babelConfig.plugins.push([
                        fileURLToPath(import.meta.resolve('@babel/plugin-transform-react-jsx')),
                    ]);
                } else {
                    // If preact-compat is disabled tell babel to
                    // transform JSX into Preact h() calls.
                    babelConfig.plugins.push([
                        fileURLToPath(import.meta.resolve('@babel/plugin-transform-react-jsx')),
                        { pragma: 'h' },
                    ]);
                }
            }

            if (webpackConfig.useVueLoader && webpackConfig.vueOptions.useJsx) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('vue3-jsx');
                babelConfig.plugins.push(
                    fileURLToPath(import.meta.resolve('@vue/babel-plugin-jsx'))
                );
            }

            babelConfig = applyOptionsCallback(
                webpackConfig.babelConfigurationCallback,
                babelConfig
            );
        }

        return [
            {
                loader: fileURLToPath(import.meta.resolve('babel-loader')),
                options: babelConfig,
            },
        ];
    },

    /**
     * @param {WebpackConfig} webpackConfig
     * @returns {RegExp} to use for the Babel loader `test` rule
     */
    getTest(webpackConfig) {
        const extensions = [
            'm?jsx?', // match .js and .jsx and .mjs
        ];

        if (webpackConfig.useBabelTypeScriptPreset) {
            extensions.push('tsx?'); // match .ts and .tsx
        }

        return new RegExp(`\\.(${extensions.join('|')})$`);
    },
};

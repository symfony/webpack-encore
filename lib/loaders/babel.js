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

            if (presetEnvOptions.useBuiltIns !== false) {
                throw new Error(
                    'The "useBuiltIns" and "corejs" Babel options are no longer supported: Babel 8 removed them from @babel/preset-env. Use babel-plugin-polyfill-corejs3 instead, added via Encore.configureBabel((babelConfig) => babelConfig.plugins.push(...)) or an external Babel configuration file. See https://babeljs.io/docs/v8-migration.'
                );
            }

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
                    // "runtime" defaults to "automatic" in Babel 8, so it no
                    // longer needs to be set explicitly.
                    applyOptionsCallback(webpackConfig.babelReactPresetOptionsCallback, {}),
                ]);
            }

            if (webpackConfig.usePreact) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('preact');

                if (webpackConfig.preactOptions.preactCompat) {
                    // If preact-compat is enabled tell babel to transform JSX
                    // into React.createElement calls. The "classic" runtime is
                    // required for that, since Babel 8 defaults to "automatic".
                    babelConfig.plugins.push([
                        fileURLToPath(import.meta.resolve('@babel/plugin-transform-react-jsx')),
                        { runtime: 'classic' },
                    ]);
                } else {
                    // If preact-compat is disabled tell babel to transform JSX
                    // into Preact h() calls. The "classic" runtime is required
                    // for the "pragma" option (Babel 8 forbids "pragma" with the
                    // default "automatic" runtime).
                    babelConfig.plugins.push([
                        fileURLToPath(import.meta.resolve('@babel/plugin-transform-react-jsx')),
                        { runtime: 'classic', pragma: 'h' },
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

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'url';

import loaderFeatures from '../features.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.js';
import babelLoader from './babel.ts';

export default {
    async getLoaders(webpackConfig: WebpackConfig) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('typescript');

        // some defaults
        let config: Record<string, any> = {
            silent: true,
        };

        // allow for ts-loader config to be controlled
        config = applyOptionsCallback<object>(
            webpackConfig.tsConfigurationCallback,
            config
        ) as Record<string, any>;

        // fork-ts-checker-webpack-plugin integration
        if (webpackConfig.useForkedTypeScriptTypeChecking) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('forkedtypecheck');
            // force transpileOnly to speed up
            config.transpileOnly = true;

            // add forked ts types plugin to the stack
            const { default: forkedTypesPluginUtil } =
                await import('../plugins/forked-ts-types.js');
            forkedTypesPluginUtil(webpackConfig);
        }

        // allow to import .vue files
        if (webpackConfig.useVueLoader) {
            config.appendTsSuffixTo = [/\.vue$/];
        }

        // use ts alongside with babel
        // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#babel
        const loaders = await babelLoader.getLoaders(webpackConfig);
        return loaders.concat([
            {
                loader: fileURLToPath(import.meta.resolve('ts-loader')),
                // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#available-options
                options: config,
            },
        ]);
    },
};

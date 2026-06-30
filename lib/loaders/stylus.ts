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
import cssLoader from './css.ts';

export default {
    getLoaders(webpackConfig: WebpackConfig, useCssModules = false) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('stylus');

        const config = {
            sourceMap: webpackConfig.useSourceMaps,
        };

        return [
            ...cssLoader.getLoaders(webpackConfig, useCssModules),
            {
                loader: fileURLToPath(import.meta.resolve('stylus-loader')),
                options: applyOptionsCallback(webpackConfig.stylusLoaderOptionsCallback, config),
            },
        ];
    },
};

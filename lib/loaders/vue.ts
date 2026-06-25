/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'url';

import loaderFeatures from '../features.js';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import getVueVersion from '../utils/get-vue-version.ts';
import type WebpackConfig from '../WebpackConfig.js';

export default {
    getLoaders(webpackConfig: WebpackConfig) {
        const vueVersion = getVueVersion(webpackConfig);
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('vue' + vueVersion);

        const options = {};

        return [
            {
                loader: fileURLToPath(import.meta.resolve('vue-loader')),
                options: applyOptionsCallback(webpackConfig.vueLoaderOptionsCallback, options),
            },
        ];
    },
};

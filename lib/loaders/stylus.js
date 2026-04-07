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
import cssLoader from './css.js';

export default {
    /**
     * @param {WebpackConfig} webpackConfig
     * @param {boolean} useCssModules
     * @returns {Array} of loaders to use for Stylus files
     */
    getLoaders(webpackConfig, useCssModules = false) {
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

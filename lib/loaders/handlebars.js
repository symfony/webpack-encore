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
     * @returns {Array} of loaders to use for Handlebars
     */
    getLoaders(webpackConfig) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('handlebars');

        const options = {};

        return [
            {
                loader: fileURLToPath(import.meta.resolve('handlebars-loader')),
                options: applyOptionsCallback(webpackConfig.handlebarsConfigurationCallback, options)
            }
        ];
    }
};

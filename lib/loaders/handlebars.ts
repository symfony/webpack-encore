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

export default {
    getLoaders(webpackConfig: WebpackConfig) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('handlebars');

        const options = {};

        return [
            {
                loader: fileURLToPath(import.meta.resolve('handlebars-loader')),
                options: applyOptionsCallback(
                    webpackConfig.handlebarsConfigurationCallback,
                    options
                ),
            },
        ];
    },
};

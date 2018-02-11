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

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for coffeescript files
 */
module.exports = {
    getLoaders(webpackConfig) {
        loaderFeatures.ensurePackagesExist('coffeescript');

        const options = {
            sourceMap: webpackConfig.useSourceMaps,
            transpile: {
                presets: ['env']
            }
        };

        // allow options to be configured
        webpackConfig.coffeeScriptConfigurationCallback.apply(
            options,
            [options]
        );

        return [
            {
                loader: 'coffee-loader',
                options: options,
            },
        ];
    }
};

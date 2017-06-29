/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderFeatures = require('../loader-features');
const babelLoader = require('./babel');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for TypeScript
 */
module.exports = {
    getLoaders(webpackConfig) {
        loaderFeatures.ensureLoaderPackagesExist('typescript');

        // some defaults
        let config = {
            silent: true,
        };

        // allow for ts-loader config to be controlled
        webpackConfig.tsConfigurationCallback.apply(
            // use config as the this variable
            config,
            [config]
        );

        // use ts alongside with babel
        // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#babel
        let loaders = babelLoader.getLoaders(webpackConfig);
        return loaders.concat([
            {
                loader: 'ts-loader',
                // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#available-options
                options: config
            }
        ]);
    }
};

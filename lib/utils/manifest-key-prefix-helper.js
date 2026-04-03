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

/**
 * Helper for determining the manifest.json key prefix.
 *
 * @param {WebpackConfig} webpackConfig
 * @returns {string}
 */
export default function(webpackConfig) {
    let manifestPrefix = webpackConfig.manifestKeyPrefix;
    if (null === manifestPrefix) {
        if (null === webpackConfig.publicPath) {
            throw new Error('publicPath is not set on WebpackConfig');
        }

        // by convention, we remove the opening slash on the manifest keys
        manifestPrefix = webpackConfig.publicPath.replace(/^\//, '');
    }

    return manifestPrefix;
}

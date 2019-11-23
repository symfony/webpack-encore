/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const loaderFeatures = require('../features');
const applyOptionsCallback = require('../utils/apply-options-callback');

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @return {Array} of loaders to use for Vue files
     */
    getOptions(webpackConfig) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('image-webpack');

        const imageWebpackLoaderOptions = {
            disable: !webpackConfig.isProduction()
        };

        return applyOptionsCallback(webpackConfig.imageWebpackLoaderCallback(), imageWebpackLoaderOptions);
    }
};

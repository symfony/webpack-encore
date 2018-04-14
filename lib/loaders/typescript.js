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
const babelLoader = require('./babel');
const applyOptionsCallback = require('../utils/apply-options-callback');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of loaders to use for TypeScript
 */
module.exports = {
    getLoaders(webpackConfig) {
        loaderFeatures.ensurePackagesExist('typescript');

        // some defaults
        let config = {
            silent: true,
        };

        // allow for ts-loader config to be controlled
        config = applyOptionsCallback(webpackConfig.tsConfigurationCallback, config);

        // fork-ts-checker-webpack-plugin integration
        if (webpackConfig.useForkedTypeScriptTypeChecking) {
            loaderFeatures.ensurePackagesExist('forkedtypecheck');
            // force transpileOnly to speed up
            config.transpileOnly = true;

            // add forked ts types plugin to the stack
            const forkedTypesPluginUtil = require('../plugins/forked-ts-types'); // eslint-disable-line
            forkedTypesPluginUtil(webpackConfig);
        }

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

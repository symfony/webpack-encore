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
const babelLoader = require('./babel');
const applyOptionsCallback = require('../utils/apply-options-callback');

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @return {Array} of loaders to use for TypeScript
     */
    getLoaders(webpackConfig) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('typescript');

        // some defaults
        let config = {
            silent: true,
        };

        // allow for ts-loader config to be controlled
        config = applyOptionsCallback(webpackConfig.tsConfigurationCallback, config);

        // fork-ts-checker-webpack-plugin integration
        if (webpackConfig.useForkedTypeScriptTypeChecking) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('forkedtypecheck');
            // force transpileOnly to speed up
            config.transpileOnly = true;

            // add forked ts types plugin to the stack
            const forkedTypesPluginUtil = require('../plugins/forked-ts-types'); // eslint-disable-line
            forkedTypesPluginUtil(webpackConfig);
        }

        // allow to import .vue files
        if (webpackConfig.useVueLoader) {
            config.appendTsSuffixTo = [/\.vue$/];
        }

        // use ts alongside with babel
        // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#babel
        let loaders = babelLoader.getLoaders(webpackConfig);
        return loaders.concat([
            {
                loader: require.resolve('ts-loader'), //eslint-disable-line node/no-unpublished-require
                // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#available-options
                options: config
            }
        ]);
    }
};

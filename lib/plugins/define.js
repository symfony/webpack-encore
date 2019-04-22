/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const PluginPriorities = require('./plugin-priorities');
const applyOptionsCallback = require('../utils/apply-options-callback');
const { loadEnv } = require('../env-helper');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    const definePluginOptions = {
        'process.env': {
            NODE_ENV: webpackConfig.isProduction() ? '"production"' : '"development"'
        }
    };

    plugins.push({
        plugin: new webpack.DefinePlugin(
            applyOptionsCallback(webpackConfig.definePluginOptionsCallback, definePluginOptions)
        ),
        priority: PluginPriorities.DefinePlugin
    });

    if (webpackConfig.shouldInjectEnvironmentVariables) {
        const envVars = Object.assign({}, process.env);
        const envVarsPath = path.isAbsolute(webpackConfig.environmentVariablesPath)
            ? webpackConfig.environmentVariablesPath
            : path.resolve(webpackConfig.getContext(), webpackConfig.environmentVariablesPath);

        loadEnv(envVars, envVarsPath, webpackConfig);

        const defs = Object.keys(envVars).reduce((acc, key) => {
            acc[`process.env.${key}`] = JSON.stringify(envVars[key]);
            return acc;
        }, {});

        plugins.push({
            plugin: new webpack.DefinePlugin(defs),
            priority: PluginPriorities.DefinePlugin
        });
    }
};

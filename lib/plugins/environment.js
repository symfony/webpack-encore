/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const webpack = require('webpack');
const path = require('path');
const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const PluginPriorities = require('./plugin-priorities');
const { loadEnv } = require('../env-helper');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    const envVars = Object.assign({}, process.env);
    const envVarsPath = path.isAbsolute(webpackConfig.environmentVariablesPath)
        ? webpackConfig.environmentVariablesPath
        : path.resolve(webpackConfig.getContext(), webpackConfig.environmentVariablesPath);

    loadEnv(envVars, envVarsPath, webpackConfig);

    plugins.push({
        plugin: new webpack.EnvironmentPlugin(envVars),
        priority: PluginPriorities.EnvironmentPlugin,
    });
};

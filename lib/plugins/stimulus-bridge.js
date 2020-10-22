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
const createPlugin = require('@symfony/stimulus-bridge/webpack-helper');
const fs = require('fs');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (webpackConfig.useStimulusBridge) {
        plugins.push({
            plugin: createPlugin(JSON.parse(fs.readFileSync(webpackConfig.stimulusOptions.controllersJsonPath))),
        });
    }
};

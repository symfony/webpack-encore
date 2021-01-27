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
const fs = require('fs');
const packageHelper = require('../package-helper');
const semver = require('semver');

/**
 * Support for @symfony/stimulus-bridge 1.1 or lower.
 *
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @deprecated
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (webpackConfig.useStimulusBridge) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('stimulus');

        const version = packageHelper.getPackageVersion('@symfony/stimulus-bridge');
        if (semver.satisfies(version, '^1.2.0')) {
            // package is new and doesn't require this plugin

            return;
        }

        const createPlugin = require('@symfony/stimulus-bridge/webpack-helper'); // eslint-disable-line node/no-unpublished-require

        plugins.push({
            plugin: createPlugin(JSON.parse(fs.readFileSync(webpackConfig.stimulusOptions.controllersJsonPath))),
        });
    }
};

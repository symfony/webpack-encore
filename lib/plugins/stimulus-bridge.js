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
const logger = require('../logger');

/**
 * Support for @symfony/stimulus-bridge 1.1 or lower.
 *
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {
    if (webpackConfig.useStimulusBridge) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('stimulus');

        try {
            require.resolve('@symfony/stimulus-bridge/webpack-helper'); // eslint-disable-line node/no-unpublished-require, node/no-missing-require
        } catch (e) {
            // package is new and doesn't require this plugin
            const version = packageHelper.getPackageVersion('@symfony/stimulus-bridge');
            if (semver.satisfies(version, '^1.0.0')) {
                logger.deprecation('Your version of @symfony/stimulus-bridge is out-of-date. Please upgrade to the latest version');
            }

            return;
        }

        const createPlugin = require('@symfony/stimulus-bridge/webpack-helper'); // eslint-disable-line node/no-unpublished-require, node/no-missing-require

        plugins.push({
            plugin: createPlugin(JSON.parse(fs.readFileSync(webpackConfig.stimulusOptions.controllersJsonPath))),
        });
    }
};

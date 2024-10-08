/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

/**
 * @import WebpackConfig from '../WebpackConfig'
 */

const packageHelper = require('../package-helper');
const semver = require('semver');
const logger = require('../logger');

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {number|string|null}
 */
module.exports = function(webpackConfig) {
    if (webpackConfig.vueOptions.version !== null) {
        return webpackConfig.vueOptions.version;
    }

    // detect installed version
    const vueVersion = packageHelper.getPackageVersion('vue');
    if (null === vueVersion) {
        // 2 is the current default version to recommend
        return 3;
    }

    if (semver.satisfies(vueVersion, '^3.0.0-beta.1')) {
        return 3;
    }

    if (semver.satisfies(vueVersion, '^1')) {
        throw new Error('vue version 1 is not supported.');
    }

    if (semver.satisfies(vueVersion, '^2')) {
        throw new Error('vue version 2 is not supported.');
    }

    logger.warning(`Your version of vue "${vueVersion}" is newer than this version of Encore supports and may or may not function properly.`);

    return 3;
};

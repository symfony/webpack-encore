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

import packageHelper from '../package-helper.js';
import semver from 'semver';
import logger from '../logger.js';

/**
 * @param {WebpackConfig} webpackConfig
 * @returns {number|string|null}
 */
export default function(webpackConfig) {
    if (webpackConfig.vueOptions.version !== null) {
        return webpackConfig.vueOptions.version;
    }

    // detect installed version
    const vueVersion = packageHelper.getPackageVersion('vue');
    if (null === vueVersion) {
        return 3;
    }

    if (semver.satisfies(vueVersion, '^3.0.0-beta.1')) {
        return 3;
    }

    if (semver.satisfies(vueVersion, '^1')) {
        throw new Error('vue version 1 is not supported.');
    }

    if (semver.satisfies(vueVersion, '^2')) {
        throw new Error('The support for Vue 2 has been removed.' +
            ' Please upgrade to Vue 3, and if necessary remove the "version" setting, or set it to 3 when calling ".enableVueLoader()".');
    }

    logger.warning(`Your version of vue "${vueVersion}" is newer than this version of Encore supports and may or may not function properly.`);

    return 3;
}

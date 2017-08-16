/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const loaderUtils = require('loader-utils');

/**
 * A "fake" loader that's set inside vue-loader for languages
 * when they are not activated in Encore.
 *
 * For example, if the user has not called enableSassLoader(),
 * then this loader is added, so that the user gets an error if
 * they try to use lang="scss" inside Vue.
 *
 * This is necessary because vue-loader *always* automatically
 * processes new lang values through a loader (e.g. lang="foo"
 * will automatically try to use a foo-loader). If we did *not*
 * register this as a loader for scss (for example), then the
 * user *would* still be able to use lang="scss"... but it would
 * not use our custom sass-loader configuration.
 *
 * @return {function}
 */
module.exports = function() {
    const options = loaderUtils.getOptions(this) || {};

    // the vue-unactivated-loader-error transformer expects some of this language
    throw new Error(`Cannot process lang="${options.lang}" inside ${this.resourcePath}: the ${options.loaderName} is not activated. Call ${options.featureCommand} in webpack.config.js to enable it.`);
};

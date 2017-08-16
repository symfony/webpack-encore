/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const TYPE = 'vue-unactivated-loader-error';

function isVueUnactivatedLoaderError(e) {
    if (e.name !== 'ModuleBuildError') {
        return false;
    }

    if (e.message.indexOf('Cannot process lang=') === -1) {
        return false;
    }

    return true;
}

function transform(error) {
    if (!isVueUnactivatedLoaderError(error)) {
        return error;
    }

    error = Object.assign({}, error);

    error.type = TYPE;
    error.severity = 900;

    return error;
}

module.exports = transform;

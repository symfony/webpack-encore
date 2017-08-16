/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const TYPE = 'missing-postcss-config';

function isMissingConfigError(e) {
    if (e.name !== 'ModuleBuildError') {
        return false;
    }

    if (e.message.indexOf('No PostCSS Config found') === -1) {
        return false;
    }

    return true;
}

function transform(error) {
    if (!isMissingConfigError(error)) {
        return error;
    }

    error = Object.assign({}, error);

    error.type = TYPE;
    error.severity = 900;

    return error;
}

module.exports = transform;

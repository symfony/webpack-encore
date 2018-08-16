/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const TYPE = 'missing-css-file';

function isMissingConfigError(e) {
    if (e.name !== 'ModuleNotFoundError') {
        return false;
    }

    if (e.message.indexOf('Module not found: Error: Can\'t resolve') === -1) {
        return false;
    }

    return true;
}

function getReference(error) {
    const index = error.message.indexOf('Can\'t resolve \'') + 15;
    const endIndex = error.message.indexOf('\' in \'');

    return error.message.substring(index, endIndex);
}

function transform(error) {
    if (!isMissingConfigError(error)) {
        return error;
    }

    error = Object.assign({}, error);

    error.type = TYPE;
    error.ref = getReference(error);
    error.severity = 900;

    return error;
}

module.exports = transform;

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const TYPE = 'feature-not-enabled';

function isMissingFeatureError(e) {
    if (e.name !== 'ModuleParseError') {
        return false;
    }

    return e.message.indexOf('Module not found') !== -1;
}

function transform(error) {
    if (!isMissingFeatureError(error)) {
        return error;
    }

    error = Object.assign({}, error);
    error.featureName = 'typescriptforked';
    error.type = TYPE;
    error.severity = 900;
    error.name = 'Feature not enabled';

    return error;
}

module.exports = transform;

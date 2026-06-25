/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { FriendlyError } from '@kocal/friendly-errors-webpack-plugin';

const TYPE = 'missing-postcss-config';

function isMissingConfigError(e: FriendlyError): boolean {
    if (!e.message || !e.message.includes('No PostCSS Config found')) {
        return false;
    }

    return true;
}

function transform(error: FriendlyError): FriendlyError {
    if (!isMissingConfigError(error)) {
        return error;
    }

    error = Object.assign({}, error);

    error.type = TYPE;
    error.severity = 900;

    return error;
}

export default transform;

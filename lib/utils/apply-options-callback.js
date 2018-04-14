/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

module.exports = function(optionsCallback, options) {
    const result = optionsCallback.call(options, options);

    if (typeof result === 'object') {
        return result;
    }

    return options;
};

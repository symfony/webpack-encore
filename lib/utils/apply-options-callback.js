/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @typedef {function(this: T, T): T|void} OptionsCallback
 * @template {object} T
 */

/**
 * @template {object} T
 * @param {OptionsCallback<T>} optionsCallback
 * @param {T} options
 * @returns {T}
 */
export default function (optionsCallback, options) {
    const result = optionsCallback.call(options, options);

    if (typeof result === 'object') {
        return result;
    }

    return options;
}

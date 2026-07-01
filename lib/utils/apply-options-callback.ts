/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type OptionsCallback<T extends object> = (
    this: T,
    options: T,
    ...extraArgs: any[]
) => T | void;

export default function <T extends object>(
    optionsCallback: OptionsCallback<T>,
    options: T,
    ...extraArgs: any[]
): T {
    const result = optionsCallback.call(options, options, ...extraArgs);

    if (typeof result === 'object') {
        return result;
    }

    return options;
}

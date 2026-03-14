/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pc from 'picocolors';
import levenshtein from 'fastest-levenshtein';

export default {
    createProxy: (Encore) => {
        const EncoreProxy = new Proxy(Encore, {
            get: (target, prop) => {
                if (typeof prop !== 'string') {
                    // Only care about strings there since prop
                    // could also be a number or a symbol
                    return target[prop];
                }

                if (typeof target[prop] === 'function') {
                    // These methods of the public API can be called even if the
                    // webpackConfig object hasn't been initialized yet.
                    const safeMethods = [
                        'configureRuntimeEnvironment',
                        'clearRuntimeEnvironment',
                        'isRuntimeEnvironmentConfigured',
                    ];

                    if (!Encore.isRuntimeEnvironmentConfigured() && !safeMethods.includes(prop)) {
                        throw new Error(`Encore.${prop}() cannot be called yet because the runtime environment doesn't appear to be configured. Make sure you're using the encore executable or call Encore.configureRuntimeEnvironment() first if you're purposely not calling Encore directly.`);
                    }

                    // Either a safe method has been called or the webpackConfig
                    // object is already available. In this case act as a passthrough.
                    return (...parameters) => {
                        try {
                            const res = target[prop](...parameters);
                            return (res === target) ? EncoreProxy : res;
                        } catch (error) {
                            console.log();
                            console.log(pc.red(error.message));
                            if (error.stack) {
                                const stackLines = error.stack.split('\n').slice(1);
                                console.log(stackLines.join('\n'));
                            }
                            process.exit(1); // eslint-disable-line
                        }
                    };
                }

                if (typeof target[prop] === 'undefined') {
                    // Find the property with the closest Levenshtein distance
                    let similarProperty;
                    let minDistance = Number.MAX_VALUE;

                    const encorePrototype = Object.getPrototypeOf(Encore);
                    for (const apiProperty of Object.getOwnPropertyNames(encorePrototype)) {
                        // Ignore class constructor
                        if (apiProperty === 'constructor') {
                            continue;
                        }

                        const distance = levenshtein.distance(apiProperty, prop);
                        if (distance <= minDistance) {
                            similarProperty = apiProperty;
                            minDistance = distance;
                        }
                    }

                    let errorMessage = `${pc.red(`Encore.${prop}`)} is not a recognized property or method.`;
                    if (minDistance < (prop.length / 3)) {
                        errorMessage += ` Did you mean ${pc.green(`Encore.${similarProperty}`)}?`;
                    }

                    console.log();
                    console.log(errorMessage);

                    process.exit(1); // eslint-disable-line
                }

                return target[prop];
            }
        });

        return EncoreProxy;
    }
};

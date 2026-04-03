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
import prettyError from './utils/pretty-error.js';

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

                            // If the method returns a Promise (e.g. getWebpackConfig()),
                            // attach a .catch() so that async rejections are also
                            // pretty-printed instead of surfacing as unhandled rejections.
                            if (res !== null && typeof res === 'object' && typeof res.then === 'function' && res !== target) {
                                return res.catch((error) => {
                                    prettyError(error);
                                    process.exit(1); // eslint-disable-line
                                });
                            }

                            return (res === target) ? EncoreProxy : res;
                        } catch (error) {
                            prettyError(error);
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

                    // Prettify the error message.
                    // Only keep the 2nd line of the stack trace:
                    // - First line should be the index.js file
                    // - Second line should be the Webpack config file
                    prettyError(
                        new Error(errorMessage),
                        { skipTrace: (traceLine, lineNumber) => lineNumber !== 1 }
                    );

                    process.exit(1); // eslint-disable-line
                }

                return target[prop];
            }
        });

        return EncoreProxy;
    }
};

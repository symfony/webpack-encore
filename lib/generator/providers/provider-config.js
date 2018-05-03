/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class ProviderConfig {
    /**
     * All the callbacks will receive the InitConfig as an argument.
     *
     * @param {InitConfig} initConfig
     * @param {function} getEntryPath
     * @param {function} getEncoreActivationMethod
     * @param {function} getDependencies
     * @param {function} build
     */
    constructor(initConfig, getEntryPath, getEncoreActivationMethod, getDependencies, build) {
        this._initConfig = initConfig;
        this._callbacks = {
            getEntryPath,
            getEncoreActivationMethod,
            getDependencies,
            build
        };
    }

    getEntryPath() {
        return this._callbacks.getEntryPath(this._initConfig);
    }

    getEncoreActivationMethod() {
        return this._callbacks.getEncoreActivationMethod(this._initConfig);
    }

    getDependencies() {
        return this._callbacks.getDependencies(this._initConfig);
    }

    build() {
        return this._callbacks.build(this._initConfig);
    }
}

module.exports = ProviderConfig;

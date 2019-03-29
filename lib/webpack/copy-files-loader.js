/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const LoaderDependency = require('webpack/lib/dependencies/LoaderDependency');

module.exports = function loader(source) {
    // This is a hack that allows `Encore.copyFiles()` to support
    // JSON files using the file-loader (which is not something
    // that is supported in Webpack 4, see https://github.com/symfony/webpack-encore/issues/535)
    //
    // Since there is no way to change the module's resource type from a loader
    // without using private properties yet we have to use "this._module".
    //
    // By setting its type to 'javascript/auto' Webpack won't try parsing
    // the result of the loader as a JSON object.
    //
    // For more information:
    // https://github.com/webpack/webpack/issues/6572#issuecomment-368376326
    // https://github.com/webpack/webpack/issues/7057
    const requiredType = 'javascript/auto';
    if (this._module.type !== requiredType) {
        // Try to retrieve the factory used by the LoaderDependency type
        // which should be the NormalModuleFactory.
        const factory = this._compilation.dependencyFactories.get(LoaderDependency);
        if (factory === undefined) {
            throw new Error('Could not retrieve module factory for type LoaderDependency');
        }

        this._module.type = requiredType;
        this._module.generator = factory.getGenerator(requiredType);
        this._module.parser = factory.getParser(requiredType);
    }

    return source;
};

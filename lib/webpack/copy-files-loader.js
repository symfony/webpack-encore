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
const fileLoader = require('file-loader');
const loaderUtils = require('loader-utils');
const path = require('path');
const fs = require('fs');

module.exports.raw = true; // Needed to avoid corrupted binary files

module.exports.default = function loader(source) {
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

    const options = loaderUtils.getOptions(this);

    // Retrieve the real path of the resource, relative
    // to the context used by copyFiles(...)
    const context = fs.realpathSync(options.context);
    const resourcePath = fs.realpathSync(this.resourcePath);
    const relativeResourcePath = path.relative(context, resourcePath);

    // Retrieve the pattern used in copyFiles(...)
    // The "source" part of the regexp is base64 encoded
    // in case it contains characters that don't work with
    // the "inline loader" syntax
    const pattern = new RegExp(
        Buffer.from(options.patternSource, 'base64').toString(),
        options.patternFlags
    );

    // If the pattern does not match the ressource's path
    // it probably means that the import was resolved using the
    // "resolve.extensions" parameter of Webpack (for instance
    // if "./test.js" was matched by "./test").
    if (!pattern.test(relativeResourcePath)) {
        return 'module.exports = "";';
    }

    // If everything is OK, let the file-loader do the copy
    return fileLoader.bind(this)(source);
};

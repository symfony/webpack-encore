/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import path from 'path';

export const raw = true; // Needed to avoid corrupted binary files

/**
 * Interpolates a filename template with the given data.
 *
 * Supports the following placeholders (compatible with the legacy file-loader):
 *   - [name]: filename without extension
 *   - [ext]: file extension without the leading dot
 *   - [path]: relative directory path from context, with trailing slash
 *   - [hash:N] or [contenthash:N]: content hash, optionally truncated to N characters
 *
 * @param {string} template - The filename template (e.g., '[path][name].[hash:8].[ext]')
 * @param {object} data
 * @param {string} data.resourcePath - Absolute path to the resource
 * @param {string} data.context - Context directory for computing relative paths
 * @param {string} data.contentHash - Pre-computed content hash
 * @returns {string} The interpolated filename
 */
function interpolateName(template, { resourcePath, context, contentHash }) {
    const parsed = path.parse(resourcePath);
    const ext = parsed.ext.slice(1); // Remove leading dot for file-loader compatibility
    const name = parsed.name;

    // Compute relative directory path from context
    let relativeDir = path.relative(context, parsed.dir).replace(/\\/g, '/');
    if (relativeDir) {
        relativeDir += '/';
    }

    // Replace parent directory markers (..) with underscores for safety
    relativeDir = relativeDir.replace(/\.\.(\/)?/g, '_$1');

    return template
        .replace(/\[name\]/g, name)
        .replace(/\[ext\]/g, ext)
        .replace(/\[path\]/g, relativeDir)
        .replace(/\[(?:content)?hash(?::(\d+))?\]/g, (match, length) => {
            return length ? contentHash.slice(0, parseInt(length, 10)) : contentHash;
        });
}

/**
 * A webpack loader that copies files to the output directory.
 *
 * This loader replaces the deprecated file-loader by using webpack's
 * native this.emitFile() API. It supports filtering files by pattern
 * and customizing output paths using template placeholders.
 *
 * @param {Buffer} source - The raw file content
 * @returns {string} An ESM module that exports the public URL of the copied file
 */
export default function loader(source) {
    const options = this.getOptions();

    // Retrieve the real path of the resource, relative
    // to the context used by copyFiles(...)
    const context = options.context;
    const resourcePath = this.resourcePath;
    const relativeResourcePath = path.relative(context, resourcePath);

    // Retrieve the pattern used in copyFiles(...)
    // The "source" part of the regexp is base64 encoded
    // in case it contains characters that don't work with
    // the "inline loader" syntax
    const pattern =
        options.regExp ||
        new RegExp(Buffer.from(options.patternSource, 'base64').toString(), options.patternFlags);

    // If the pattern does not match the resource's path
    // it probably means that the import was resolved using the
    // "resolve.extensions" parameter of Webpack (for instance
    // if "./test.js" was matched by "./test").
    if (!pattern.test(relativeResourcePath)) {
        return 'export default "";';
    }

    // Compute content hash using webpack's built-in hashing utilities
    // This uses the hash function configured in webpack (e.g., xxhash64)
    const hash = this.utils.createHash();
    hash.update(source);
    const contentHash = hash.digest('hex');

    // Interpolate the output filename using the template
    const outputPath = interpolateName(options.filename, {
        resourcePath,
        context,
        contentHash,
    });

    // Build asset info for webpack
    const assetInfo = {
        sourceFilename: path.relative(this.rootContext, resourcePath).replace(/\\/g, '/'),
    };

    // Check if filename contains a hash (for immutability hints)
    if (/\[(?:content)?hash(?::\d+)?\]/i.test(options.filename)) {
        assetInfo.immutable = true;
    }

    // Emit the file to the output directory
    this.emitFile(outputPath, source, null, assetInfo);

    // Return a module that exports the public URL
    return `export default __webpack_public_path__ + ${JSON.stringify(outputPath)};`;
}

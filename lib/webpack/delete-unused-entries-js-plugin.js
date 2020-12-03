/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

function DeleteUnusedEntriesJSPlugin(entriesToDelete = []) {
    this.entriesToDelete = entriesToDelete;
}
DeleteUnusedEntriesJSPlugin.prototype.apply = function(compiler) {
    const deleteEntries = (compilation) => {
        // loop over output chunks
        compilation.chunks.forEach((chunk) => {
            // see of this chunk is one that needs its .js deleted
            if (this.entriesToDelete.includes(chunk.name)) {
                const removedFiles = [];

                // look for main files to delete first
                for (const filename of Array.from(chunk.files)) {
                    if (/\.js?(\?[^.]*)?$/.test(filename)) {
                        removedFiles.push(filename);
                        // remove the output file
                        compilation.deleteAsset(filename);
                        // remove the file, so that it does not dump in the manifest
                        chunk.files.delete(filename);
                    }
                }

                // then also look in auxiliary files for source maps
                for (const filename of Array.from(chunk.auxiliaryFiles)) {
                    if (removedFiles.map(name => `${name}.map`).includes(`${filename}`)) {
                        removedFiles.push(filename);
                        // remove the output file
                        compilation.deleteAsset(filename);
                        // remove the file, so that it does not dump in the manifest
                        chunk.auxiliaryFiles.delete(filename);
                    }
                }

                // sanity check: make sure 1 or 2 files were deleted
                // if there's some edge case where more .js files
                // or 0 .js files might be deleted, I'd rather error
                if (removedFiles.length === 0 || removedFiles.length > 2) {
                    throw new Error(`Problem deleting JS entry for ${chunk.name}: ${removedFiles.length} files were deleted (${removedFiles.join(', ')})`);
                }
            }
        });
    };

    compiler.hooks.compilation.tap('DeleteUnusedEntriesJSPlugin', function(compilation) {
        compilation.hooks.additionalAssets.tap(
            'DeleteUnusedEntriesJsPlugin',
            function() {
                deleteEntries(compilation);
            }
        );
    });
};

module.exports = DeleteUnusedEntriesJSPlugin;

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
    compiler.plugin('emit', (compilation, callback) => {

        // loop over output chunks
        compilation.chunks.forEach((chunk) => {
            // see of this chunk is one that needs its .js deleted
            if (this.entriesToDelete.includes(chunk.name)) {
                let fileDeleteCount = 0;

                // loop over the output files and find the 1 that ends in .js
                chunk.files.forEach((filename) => {
                    if (/\.js(\.map)?(\?[^.]*)?$/.test(filename)) {
                        fileDeleteCount++;
                        // remove the output file
                        delete compilation.assets[filename];
                        // remove the file, so that it does not dump in the manifest
                        chunk.files.splice(chunk.files.indexOf(filename), 1);
                    }
                });

                // sanity check: make sure 1 or 2 files were deleted
                // if there's some edge case where more .js files
                // or 0 .js files might be deleted, I'd rather error
                if (fileDeleteCount === 0 || fileDeleteCount > 2) {
                    throw new Error(`Problem deleting JS entry for ${chunk.name}: ${fileDeleteCount} files were deleted`);
                }
            }
        });

        callback();
    });
};

module.exports = DeleteUnusedEntriesJSPlugin;

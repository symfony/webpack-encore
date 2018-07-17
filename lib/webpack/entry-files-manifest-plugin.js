/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const logger = require('../logger');
const fse = require('fs-extra');

const bugMessage = 'This is possibly a bug, but will not impact your setup unless you use the entrypoints.json (e.g. splitEntryChunks()) file. To be super awesome, please report this as an issue.';

function EntryFilesManifestPlugin(manifestFilename, entryNamesToSkip, styleEntriesMap) {
    this.manifestFilename = manifestFilename;
    this.entryNamesToSkip = entryNamesToSkip;
    this.styleEntriesMap = styleEntriesMap;
}

/**
 * @param {Entrypoint} entryPoint
 * @returns {object}
 */
function extractChunkIds(entryPoint) {
    const files = {
        jsChunkIds: [],
        cssChunkIds: [],
    };

    for (let chunk of entryPoint.chunks) {
        for (let filename of chunk.files) {
            if (/\.js$/.test(filename)) {
                // use the chunk id because we do not want the versioned filename
                files.jsChunkIds.push(chunk.id);
            } else if (/\.css$/.test(filename)) {
                files.cssChunkIds.push(chunk.id);
            } else {
                logger.warning(`Unable to determine file type for entry ${filename}. ${bugMessage}`);
            }
        }
    }

    return files;
}

function getChunkNameFromId(allChunks, chunkId) {
    const matchedChunk = allChunks.find(chunk => {
        return chunk.id === chunkId;
    });

    if (!matchedChunk) {
        logger.warning(`Could not locate chunk with id ${chunkId}. ${bugMessage}`);

        return false;
    }

    if (typeof matchedChunk.name !== 'undefined') {
        return matchedChunk.name;
    }

    // this can happen if the chunk was already split due to async code splitting
    if (matchedChunk.files.length !== 1) {
        logger.warning(`Found ${matchedChunk.files.length} files in chunk id ${matchedChunk.id} but expected exactly 1. ${bugMessage}`);

        return false;
    }

    // the only file has the correct filename (without versioning problems)
    return matchedChunk.files[0];
}

function convertChunkIdsToChunkNames(allChunks, chunkIds) {
    return chunkIds.map(
        chunkId => getChunkNameFromId(allChunks, chunkId)
    ).filter(chunkName => chunkName !== false);
}

function convertChunkNamesToFilenames(chunkNames, extension) {
    return chunkNames.map(chunkName => {
        // possible for the async-split chunks
        if (chunkName.endsWith(`.${extension}`)) {
            return chunkName;
        }

        return `${chunkName}.${extension}`;
    });
}

EntryFilesManifestPlugin.prototype.apply = function(compiler) {
    const done = (stats) => {
        const entrypoints = {};
        stats.compilation.entrypoints.forEach((entry, entryName) => {
            if (this.entryNamesToSkip.includes(entryName)) {
                return;
            }

            let { cssChunkIds, jsChunkIds } = extractChunkIds(entry);

            // for style entries, there are no js files
            // this makes sure runtime.js is not included
            if (this.styleEntriesMap.has(entryName)) {
                jsChunkIds = [];
            }

            // look up the original chunk name by id
            const cssChunkNames = convertChunkIdsToChunkNames(stats.compilation.chunks, cssChunkIds);
            const jsChunkNames = convertChunkIdsToChunkNames(stats.compilation.chunks, jsChunkIds);

            const cssFiles = convertChunkNamesToFilenames(cssChunkNames, 'css');
            const jsFiles = convertChunkNamesToFilenames(jsChunkNames, 'js');

            entrypoints[entryName] = {
                js: jsFiles,
                css: cssFiles,
            };
        });

        fse.outputFileSync(
            this.manifestFilename,
            JSON.stringify(entrypoints, null, 2)
        );
    };

    compiler.hooks.done.tap(
        { name: 'EntryFilesManifestPlugin' },
        done
    );
};

module.exports = EntryFilesManifestPlugin;

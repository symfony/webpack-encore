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
                logger.debug(`Unable to determine file type for entry ${filename}. This is possibly a bug, but will not impact your setup unless you use the entrypoints.json file. To be super awesome, please report this as an issue.`);
            }
        }
    }

    return files;
}

function getChunkNameFromId(allChunks, chunkId) {
    return allChunks.find(chunk => {
        return chunk.id === chunkId;
    }).name;
}

function convertChunkNamesToFilenames(chunkNames, extension) {
    return chunkNames.map(chunkName => `${chunkName}.${extension}`);
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
            const cssChunkNames = cssChunkIds.map(chunkId => getChunkNameFromId(stats.compilation.chunks, chunkId));
            const jsChunkNames = jsChunkIds.map(chunkId => getChunkNameFromId(stats.compilation.chunks, chunkId));

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

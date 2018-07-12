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

function EntryFilesManifestPlugin(manifestFilename, entryNamesToSkip) {
    this.manifestFilename = manifestFilename;
    this.entryNamesToSkip = entryNamesToSkip;
}

/**
 * @param {Entrypoint} entryPoint
 * @returns {object}
 */
function extractFiles(entryPoint) {
    const files = {
        jsFiles: [],
        cssFiles: [],
    };

    for (let chunk of entryPoint.chunks) {
        for (let filename of chunk.files) {
            if (/\.js$/.test(filename)) {
                // use the chunk id because we do not want the versioned filename
                files.jsFiles.push(`${chunk.id}.js`);
            } else if (/\.css$/.test(filename)) {
                files.cssFiles.push(`${chunk.id}.css`);
            } else {
                logger.debug(`Unable to determine file type for entry ${filename}. This is possibly a bug, but will not impact your setup unless you use the entrypoints.json file. To be super awesome, please report this as an issue.`);
            }
        }
    }

    return files;
}

EntryFilesManifestPlugin.prototype.apply = function(compiler) {
    const done = (stats) => {
        const entrypoints = {};
        stats.compilation.entrypoints.forEach((entry, entryName) => {
            if (this.entryNamesToSkip.includes(entryName)) {
                return;
            }

            const { cssFiles, jsFiles } = extractFiles(entry);
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

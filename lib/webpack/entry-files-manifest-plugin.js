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

function EntryFilesManifestPlugin(manifestFilename = []) {
    this.manifestFilename = manifestFilename;
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
    for (let filename of entryPoint.getFiles()) {
        if (/\.js$/.test(filename)) {
            files.jsFiles.push(filename);
        } else if (/\.css$/.test(filename)) {
            files.cssFiles.push(filename);
        } else {
            logger.debug(`Unable to determine file type for entry ${filename}. This is possibly a bug, but will not impact your setup unless you use the entrypoints.json file.`);
        }
    }

    return files;
}

EntryFilesManifestPlugin.prototype.apply = function(compiler) {
    const done = (stats) => {
        const entrypoints = {};
        stats.compilation.entrypoints.forEach((entry, entryName) => {
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
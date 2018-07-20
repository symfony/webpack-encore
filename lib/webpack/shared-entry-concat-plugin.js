/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const sharedEntryTmpName = require('../utils/sharedEntryTmpName');

function SharedEntryConcatPlugin(sharedEntryName, buildDir) {
    this.sharedEntryName = sharedEntryName;
    this.buildDir = buildDir;
}

function getChunkFilename(stats, chunkName) {
    const chunk = stats.compilation.namedChunks.get(chunkName);

    if (!chunk) {
        throw new Error(`Cannot find chunk ${chunkName}`);
    }

    const jsFiles = chunk.files.filter(filename => {
        return /\.js$/.test(filename);
    });

    if (jsFiles.length !== 1) {
        throw new Error(`Invalid number of files for chunk ${chunkName} - got ${jsFiles.join(', ')}`);
    }

    return jsFiles[0];
}

SharedEntryConcatPlugin.prototype.apply = function(compiler) {
    const done = (stats) => {
        if (stats.hasErrors()) {
            return;
        }

        /*
         * This is a hack. See ConfigGenerator.buildEntryConfig()
         * for other details.
         *
         * Basically, the "_tmp_shared" entry is created automatically
         * as a "fake" entry. Internally, it simply requires the same
         * file that is the source file of the shared entry.
         *
         * In this plugin, we literally read the final, compiled _tmp_shared.js
         * entry, and put its contents at the bottom of the final, compiled,
         * shared commons file. Then, we delete _tmp_shared.js. This
         * is because the shared entry is actually "removed" as an entry
         * file in SplitChunksPlugin, which means that if it contains
         * any code that should be executed, that code is not normally
         * executed. This fixes that.
         */

        const sharedEntryOutputFile = path.join(this.buildDir, getChunkFilename(stats, this.sharedEntryName));
        const tmpEntryBootstrapFile = path.join(this.buildDir, getChunkFilename(stats, sharedEntryTmpName));

        if (!fs.existsSync(sharedEntryOutputFile)) {
            throw new Error(`Could not find shared entry output file: ${sharedEntryOutputFile}`);
        }

        if (!fs.existsSync(tmpEntryBootstrapFile)) {
            throw new Error(`Could not find temporary shared entry bootstrap file: ${tmpEntryBootstrapFile}`);
        }

        fs.writeFileSync(
            sharedEntryOutputFile,
            [fs.readFileSync(sharedEntryOutputFile), fs.readFileSync(tmpEntryBootstrapFile)].join('\n')
        );

        fs.unlinkSync(tmpEntryBootstrapFile);
    };

    compiler.hooks.done.tap(
        { name: 'SharedEntryConcatPlugin' },
        done
    );
};

module.exports = SharedEntryConcatPlugin;

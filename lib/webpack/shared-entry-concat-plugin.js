/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const sharedEntryTmpName = require('../utils/sharedEntryTmpName');
const RawSource = require('webpack-sources/lib/RawSource');

function SharedEntryConcatPlugin(sharedEntryName) {
    this.sharedEntryName = sharedEntryName;
}

function getChunkFilename(compilation, chunkName) {
    const chunk = compilation.namedChunks.get(chunkName);
    // any "additional" files - like .hot-update.js when using --hot
    const additionalChunkAssets = compilation.additionalChunkAssets || [];

    if (!chunk) {
        throw new Error(`Cannot find chunk ${chunkName}`);
    }

    const jsFiles = chunk.files.filter(filename => {
        return /\.js$/.test(filename) && !additionalChunkAssets.includes(filename);
    });

    if (jsFiles.length !== 1) {
        throw new Error(`Invalid number of files for chunk ${chunkName} - got ${jsFiles.join(', ')}`);
    }

    return jsFiles[0];
}

/**
 * @param {Source} asset
 * @return {string}
 */
function getAssetSource(asset) {
    let content = asset.source();
    if (Buffer.isBuffer(content)) {
        content = content.toString('utf-8');
    }

    return content;
}

SharedEntryConcatPlugin.prototype.apply = function(compiler) {
    const emit = (compilation) => {
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

        const sharedEntryOutputFile = getChunkFilename(compilation, this.sharedEntryName);
        const tmpEntryFile = getChunkFilename(compilation, sharedEntryTmpName);
        const assets = compilation.assets;

        const sharedEntryAsset = assets[sharedEntryOutputFile];
        const tmpEntryAsset = assets[tmpEntryFile];

        if (typeof sharedEntryAsset === 'undefined') {
            throw new Error(`Could not find shared entry output file: ${sharedEntryOutputFile}`);
        }

        if (typeof assets[tmpEntryFile] === 'undefined') {
            throw new Error(`Could not find temporary shared entry bootstrap file: ${tmpEntryFile}`);
        }

        assets[sharedEntryOutputFile] = new RawSource(
            [getAssetSource(sharedEntryAsset), getAssetSource(tmpEntryAsset)].join('\n')
        );

        delete(assets[tmpEntryFile]);
    };

    compiler.hooks.emit.tap(
        { name: 'SharedEntryConcatPlugin' },
        emit
    );
};

module.exports = SharedEntryConcatPlugin;

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
const crypto = require('crypto');
const copyEntryTmpName = require('../utils/copyEntryTmpName');

/**
 * Return the file extension from a filename, without the leading dot and without the query string (if any).
 *
 * @param {string} filename
 * @returns {string}
 */
function getFileExtension(filename) {
    return path.extname(filename).slice(1).split('?')[0];
}

class EntryPointsPlugin {
    /**
     * @param {object} options
     * @param {string} options.publicPath The public path of the assets, from where they are served
     * @param {string} options.outputPath The output path of the assets, from where they are saved
     * @param {Array<string>} options.integrityAlgorithms The algorithms to use for the integrity hash
     */
    constructor({
        publicPath,
        outputPath,
        integrityAlgorithms
    }) {
        this.publicPath = publicPath;
        this.outputPath = outputPath;
        this.integrityAlgorithms = integrityAlgorithms;
    }

    /**
     * @param {import('webpack').Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync({ name: 'EntryPointsPlugin' }, (compilation, callback) => {
            const manifest = {
                entrypoints: {},
            };

            const stats = compilation.getStats().toJson({
                assets: true,
                moduleAssets: true,
                relatedAssets: false,
                chunkGroupAuxiliary: false,
                chunks: false,
                modules: false,
                timings: false,
                logging: false,
                errorDetails: false,
            });

            for (const [entryName, entry] of Object.entries(stats.entrypoints)) {
                // We don't want to include the temporary entry in the manifest
                if (entryName === copyEntryTmpName) {
                    continue;
                }

                manifest.entrypoints[entryName] = {};

                for (const asset of entry.assets) {
                    // We don't want to include hot-update files in the manifest
                    if (asset.name.includes('.hot-update.')) {
                        continue;
                    }

                    const fileExtension = getFileExtension(asset.name);
                    const assetPath = this.publicPath.slice(-1) === '/'
                        ? `${this.publicPath}${asset.name}`
                        : `${this.publicPath}/${asset.name}`;

                    if (!(fileExtension in manifest.entrypoints[entryName])) {
                        manifest.entrypoints[entryName][fileExtension] = [];
                    }

                    manifest.entrypoints[entryName][fileExtension].push(assetPath);
                }
            }

            if (this.integrityAlgorithms.length > 0) {
                manifest.integrity = {};

                for (const entryName in manifest.entrypoints) {
                    for (const fileType in manifest.entrypoints[entryName]) {
                        for (const asset of manifest.entrypoints[entryName][fileType]) {
                            if (asset in manifest.integrity) {
                                continue;
                            }

                            // Drop query string if any
                            const assetNormalized = asset.includes('?') ? asset.split('?')[0] : asset;
                            if (assetNormalized in manifest.integrity) {
                                continue;
                            }

                            const filePath = path.resolve(
                                this.outputPath,
                                assetNormalized.replace(this.publicPath, ''),
                            );

                            if (fs.existsSync(filePath)) {
                                const fileHashes = [];

                                for (const algorithm of this.integrityAlgorithms) {
                                    const hash = crypto.createHash(algorithm);
                                    const fileContent = fs.readFileSync(filePath, 'utf8');
                                    hash.update(fileContent, 'utf8');

                                    fileHashes.push(`${algorithm}-${hash.digest('base64')}`);
                                }

                                manifest.integrity[asset] = fileHashes.join(' ');
                            }
                        }
                    }
                }
            }

            fs.writeFileSync(
                path.join(this.outputPath, 'entrypoints.json'),
                JSON.stringify(manifest, null, 2),
                { flag: 'w' },
            );

            callback();
        });
    }
}

module.exports = { EntryPointsPlugin };

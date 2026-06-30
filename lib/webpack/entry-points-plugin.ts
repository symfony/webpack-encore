/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import type webpack from 'webpack';

import copyEntryTmpName from '../utils/copyEntryTmpName.ts';

interface EntryPointsManifest {
    entrypoints: Record<string, Record<string, string[]>>;
    integrity?: Record<string, string>;
}

/**
 * Return the file extension from a filename, without the leading dot and without the query string (if any).
 */
function getFileExtension(filename: string): string {
    return path.extname(filename).slice(1).split('?')[0]!;
}

export class EntryPointsPlugin {
    publicPath: string;
    outputPath: string;
    integrityAlgorithms: string[];

    /**
     * @param options
     * @param options.publicPath The public path of the assets, from where they are served
     * @param options.outputPath The output path of the assets, from where they are saved
     * @param options.integrityAlgorithms The algorithms to use for the integrity hash
     */
    constructor({
        publicPath,
        outputPath,
        integrityAlgorithms,
    }: {
        publicPath: string;
        outputPath: string;
        integrityAlgorithms: string[];
    }) {
        this.publicPath = publicPath;
        this.outputPath = outputPath;
        this.integrityAlgorithms = integrityAlgorithms;
    }

    apply(compiler: webpack.Compiler): void {
        compiler.hooks.afterEmit.tapAsync(
            { name: 'EntryPointsPlugin' },
            (compilation, callback) => {
                const manifest: EntryPointsManifest = {
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

                for (const [entryName, entry] of Object.entries(stats.entrypoints ?? {})) {
                    // We don't want to include the temporary entry in the manifest
                    if (entryName === copyEntryTmpName) {
                        continue;
                    }

                    const entrypoint: Record<string, string[]> = {};
                    manifest.entrypoints[entryName] = entrypoint;

                    for (const asset of entry.assets ?? []) {
                        // We don't want to include hot-update files in the manifest
                        if (asset.name.includes('.hot-update.')) {
                            continue;
                        }

                        const fileExtension = getFileExtension(asset.name);
                        const assetPath =
                            this.publicPath.slice(-1) === '/'
                                ? `${this.publicPath}${asset.name}`
                                : `${this.publicPath}/${asset.name}`;

                        (entrypoint[fileExtension] ??= []).push(assetPath);
                    }
                }

                if (this.integrityAlgorithms.length > 0) {
                    const integrity: Record<string, string> = {};
                    manifest.integrity = integrity;

                    for (const fileTypes of Object.values(manifest.entrypoints)) {
                        for (const assets of Object.values(fileTypes)) {
                            for (const asset of assets) {
                                if (asset in integrity) {
                                    continue;
                                }

                                // Drop query string if any
                                const assetNormalized = asset.includes('?')
                                    ? asset.split('?')[0]!
                                    : asset;
                                if (assetNormalized in integrity) {
                                    continue;
                                }

                                const filePath = path.resolve(
                                    this.outputPath,
                                    assetNormalized.replace(this.publicPath, '')
                                );

                                if (fs.existsSync(filePath)) {
                                    const fileHashes: string[] = [];

                                    for (const algorithm of this.integrityAlgorithms) {
                                        const hash = crypto.createHash(algorithm);
                                        const fileContent = fs.readFileSync(filePath, 'utf8');
                                        hash.update(fileContent, 'utf8');

                                        fileHashes.push(`${algorithm}-${hash.digest('base64')}`);
                                    }

                                    integrity[asset] = fileHashes.join(' ');
                                }
                            }
                        }
                    }
                }

                fs.writeFileSync(
                    path.join(this.outputPath, 'entrypoints.json'),
                    JSON.stringify(manifest, null, 2),
                    { flag: 'w' }
                );

                callback();
            }
        );
    }
}

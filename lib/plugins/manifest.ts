/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { WebpackManifestPlugin } from 'webpack-manifest-plugin';

import applyOptionsCallback from '../utils/apply-options-callback.ts';
import copyEntryTmpName from '../utils/copyEntryTmpName.ts';
import manifestKeyPrefixHelper from '../utils/manifest-key-prefix-helper.ts';
import type WebpackConfig from '../WebpackConfig.js';
import PluginPriorities from './plugin-priorities.ts';

type ManifestPluginOptions = {
    seed: object;
    basePath: string;
    writeToFileEmit: boolean;
    filter: (file: any) => boolean;
    map?: (file: any) => any;
};

export default function (
    plugins: Array<{ plugin: object; priority: number }>,
    webpackConfig: WebpackConfig
): void {
    let manifestPluginOptions: ManifestPluginOptions = {
        seed: {},
        basePath: manifestKeyPrefixHelper(webpackConfig),
        // always write a manifest.json file, even with webpack-dev-server
        writeToFileEmit: true,
        filter: (file) => {
            const isCopyEntry = file.isChunk && copyEntryTmpName === file.chunk.id;
            const isStyleEntry = file.isChunk && webpackConfig.styleEntries.has(file.chunk.name);
            const isJsOrJsMapFile = /\.js(\.map)?$/.test(file.name);

            return !isCopyEntry && !(isStyleEntry && isJsOrJsMapFile);
        },
    };

    manifestPluginOptions = applyOptionsCallback<object>(
        webpackConfig.manifestPluginOptionsCallback,
        manifestPluginOptions
    ) as ManifestPluginOptions;

    const userMapOption = manifestPluginOptions.map;
    manifestPluginOptions.map = (file) => {
        const newFile = Object.assign({}, file, {
            name: file.name.replace('?copy-files-loader', ''),
        });

        if (typeof userMapOption === 'function') {
            return userMapOption(newFile);
        }

        return newFile;
    };

    plugins.push({
        plugin: new WebpackManifestPlugin(manifestPluginOptions),
        priority: PluginPriorities.WebpackManifestPlugin,
    });
}

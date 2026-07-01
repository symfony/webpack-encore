/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type FriendlyErrorsWebpackPlugin from '@kocal/friendly-errors-webpack-plugin';
import pc from 'picocolors';
import type { Compilation, Compiler } from 'webpack';

class AssetOutputDisplayPlugin {
    outputPath: string;
    friendlyErrorsPlugin: FriendlyErrorsWebpackPlugin;

    constructor(outputPath: string, friendlyErrorsPlugin: FriendlyErrorsWebpackPlugin) {
        this.outputPath = outputPath;
        this.friendlyErrorsPlugin = friendlyErrorsPlugin;
    }

    apply(compiler: Compiler): void {
        const emit = (compilation: Compilation, callback: () => void) => {
            // completely reset messages key to avoid adding more and more messages
            // when using watch
            const plugin = this.friendlyErrorsPlugin as FriendlyErrorsWebpackPlugin & {
                compilationSuccessInfo: { messages: string[] };
            };
            plugin.compilationSuccessInfo.messages = [
                `${pc.yellow(Object.keys(compilation.assets).length)} files written to ${pc.yellow(this.outputPath)}`,
            ];

            callback();
        };

        compiler.hooks.emit.tapAsync({ name: 'AssetOutputDisplayPlugin' }, emit);
    }
}

export default AssetOutputDisplayPlugin;

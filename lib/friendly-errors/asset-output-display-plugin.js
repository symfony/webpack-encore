/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chalk = require('chalk').default;

function AssetOutputDisplayPlugin(outputPath, friendlyErrorsPlugin) {
    this.outputPath = outputPath;
    this.friendlyErrorsPlugin = friendlyErrorsPlugin;
}

AssetOutputDisplayPlugin.prototype.apply = function(compiler) {
    const emit = (compilation, callback) => {
        // completely reset messages key to avoid adding more and more messages
        // when using watch
        this.friendlyErrorsPlugin.compilationSuccessInfo.messages = [
            `${chalk.yellow(Object.keys(compilation.assets).length)} files written to ${chalk.yellow(this.outputPath)}`
        ];

        callback();
    };

    compiler.hooks.emit.tapAsync(
        { name: 'AssetOutputDisplayPlugin' },
        emit
    );
};

module.exports = AssetOutputDisplayPlugin;

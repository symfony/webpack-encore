/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const DeleteUnusedEntriesJSPlugin = require('../webpack/delete-unused-entries-js-plugin');

/**
 * @param {WebpackConfig} webpackConfig
 * @return {Array} of plugins to add to webpack
 */
module.exports = {
    getPlugins(webpackConfig) {

        return [new DeleteUnusedEntriesJSPlugin(
            // transform into an Array
            [... webpackConfig.styleEntries.keys()]
        )];
    }
};

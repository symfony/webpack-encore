/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const DeleteUnusedEntriesJSPlugin = require('../webpack/delete-unused-entries-js-plugin');

/**
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
module.exports = function(plugins, webpackConfig) {

    plugins.push(new DeleteUnusedEntriesJSPlugin(
        // transform into an Array
        [... webpackConfig.styleEntries.keys()]
    ));
};

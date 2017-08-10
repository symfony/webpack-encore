/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const pathUtil = require('../config/path-util');
const AssetOutputDisplayPlugin = require('../friendly-errors/asset-output-display-plugin');

/**
 * Updates plugins array passed adding AssetOutputDisplayPlugin instance
 *
 * @param {Array} plugins
 * @param {WebpackConfig} webpackConfig
 * @param {FriendlyErrorsWebpackPlugin} friendlyErrorsPlugin
 * @return {void}
 */
module.exports = function(plugins, webpackConfig, friendlyErrorsPlugin) {
    if (webpackConfig.useDevServer()) {
        return;
    }

    const outputPath = pathUtil.getRelativeOutputPath(webpackConfig);
    plugins.push(new AssetOutputDisplayPlugin(outputPath, friendlyErrorsPlugin));
};

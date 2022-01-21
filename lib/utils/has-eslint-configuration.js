/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';


function isMissingConfigError(e) {
    if (!e.message || !e.message.includes('No ESLint configuration found')) {
        return false;
    }

    return true;
}

/**
 * @returns {Promise<boolean>}
 */
module.exports = async function() {
    /**
     * @param {WebpackConfig} webpackConfig
     * @returns {Promise<boolean>}
     */
    return async function(webpackConfig) {
        const { ESLint } = require('eslint'); // eslint-disable-line node/no-unpublished-require
        const eslint = new ESLint({
            cwd: webpackConfig.runtimeConfig.context,
        });

        try {
            await eslint.calculateConfigForFile('webpack.config.js');
        } catch (e) {
            return !isMissingConfigError(e);
        }

        return true;
    };
};

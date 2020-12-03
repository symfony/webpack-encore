/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const WebpackConfig = require('../WebpackConfig'); //eslint-disable-line no-unused-vars
const loaderFeatures = require('../features');
const applyOptionsCallback = require('../utils/apply-options-callback');

function isMissingConfigError(e) {
    if (!e.message || !e.message.includes('No ESLint configuration found')) {
        return false;
    }

    return true;
}

module.exports = {
    /**
     * @param {WebpackConfig} webpackConfig
     * @return {Object} of options to use for eslint-loader options.
     */
    getOptions(webpackConfig) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('eslint');

        const eslint = require('eslint'); // eslint-disable-line node/no-unpublished-require
        const engine = new eslint.CLIEngine({
            cwd: webpackConfig.runtimeConfig.context,
        });

        try {
            engine.getConfigForFile('webpack.config.js');
        } catch (e) {
            if (isMissingConfigError(e)) {
                const chalk = require('chalk');
                const packageHelper = require('../package-helper');

                const message = `No ESLint configration has been found.

${chalk.bgGreen.black('', 'FIX', '')} Run command ${chalk.yellow('./node_modules/.bin/eslint --init')} or manually create a ${chalk.yellow('.eslintrc.js')} file at the root of your project.

If you prefer to create a ${chalk.yellow('.eslintrc.js')} file by yourself, here is an example to get you started:

${chalk.yellow(`// .eslintrc.js
module.exports = {
    parser: 'babel-eslint',
    extends: ['eslint:recommended'],
}
`)}

Install ${chalk.yellow('babel-eslint')} to prevent potential parsing issues: ${packageHelper.getInstallCommand([[{ name: 'babel-eslint' }]])}

`;
                throw new Error(message);
            }

            throw e;
        }

        const eslintLoaderOptions = {
            cache: true,
            emitWarning: true
        };

        return applyOptionsCallback(webpackConfig.eslintLoaderOptionsCallback, eslintLoaderOptions);
    },

    /**
     * @param {WebpackConfig} webpackConfig
     * @return {RegExp} to use for eslint-loader `test` rule
     */
    getTest(webpackConfig) {
        const extensions = ['jsx?'];

        if (webpackConfig.eslintOptions.lintVue) {
            extensions.push('vue');
        }

        return new RegExp(`\\.(${extensions.join('|')})$`);
    }
};

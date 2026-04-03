/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import FriendlyErrorsWebpackPlugin from '@kocal/friendly-errors-webpack-plugin';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import friendlyErrorsPluginUtil from '../../lib/plugins/friendly-errors.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/friendly-errors', function() {
    it('with default settings', function() {
        const config = createConfig();

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).to.be.instanceof(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).to.equal(false);
        expect(plugin.formatters.length).to.equal(6);
        expect(plugin.transformers.length).to.equal(6);
    });

    it('with options callback', function() {
        const config = createConfig();

        config.configureFriendlyErrorsPlugin((options) => {
            options.clearConsole = true;
            options.additionalFormatters = [];
        });

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).to.be.instanceof(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).to.equal(true);
        expect(plugin.formatters.length).to.equal(3);
        expect(plugin.transformers.length).to.equal(6);
    });

    it('with options callback that returns an object', function() {
        const config = createConfig();

        config.configureFriendlyErrorsPlugin((options) => {
            options.clearConsole = false;

            // This should override the original config
            return { additionalFormatters: [] };
        });

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).to.be.instanceof(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).to.equal(true);
        expect(plugin.formatters.length).to.equal(3);
        expect(plugin.transformers.length).to.equal(3);
    });
});

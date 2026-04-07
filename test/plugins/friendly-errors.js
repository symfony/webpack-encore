/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import FriendlyErrorsWebpackPlugin from '@kocal/friendly-errors-webpack-plugin';
import { describe, it, expect } from 'vitest';

import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import friendlyErrorsPluginUtil from '../../lib/plugins/friendly-errors.js';
import WebpackConfig from '../../lib/WebpackConfig.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/friendly-errors', function () {
    it('with default settings', function () {
        const config = createConfig();

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).toBeInstanceOf(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).toBe(false);
        expect(plugin.formatters.length).toBe(6);
        expect(plugin.transformers.length).toBe(6);
    });

    it('with options callback', function () {
        const config = createConfig();

        config.configureFriendlyErrorsPlugin((options) => {
            options.clearConsole = true;
            options.additionalFormatters = [];
        });

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).toBeInstanceOf(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).toBe(true);
        expect(plugin.formatters.length).toBe(3);
        expect(plugin.transformers.length).toBe(6);
    });

    it('with options callback that returns an object', function () {
        const config = createConfig();

        config.configureFriendlyErrorsPlugin((options) => {
            options.clearConsole = false;

            // This should override the original config
            return { additionalFormatters: [] };
        });

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).toBeInstanceOf(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).toBe(true);
        expect(plugin.formatters.length).toBe(3);
        expect(plugin.transformers.length).toBe(3);
    });
});

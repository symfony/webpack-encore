/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import TerserPlugin from 'terser-webpack-plugin';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import terserPluginUtil from '../../lib/plugins/terser.js';

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/terser', function() {
    it('production environment default settings', function() {
        const config = createConfig();

        const plugin = terserPluginUtil(config);
        expect(plugin).toBeInstanceOf(TerserPlugin);
        expect(plugin.options.parallel).toBe(true);
    });

    it('with options callback', function() {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.test = 'custom_test';
        });

        const plugin = terserPluginUtil(config);

        // Allows to override default options
        expect(plugin.options.test).toBe('custom_test');

        // Doesn't remove default options
        expect(plugin.options.parallel).toBe(true);
    });

    it('with options callback that returns an object', function() {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.test = 'custom_test';

            // This should override the original config
            return { parallel: false };
        });

        const plugin = terserPluginUtil(config);
        expect(plugin.options.test).not.toBe('custom_test');
        expect(plugin.options.parallel).toBe(false);
    });
});

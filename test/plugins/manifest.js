/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import manifestPluginUtil from '../../lib/plugins/manifest.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    const config = new WebpackConfig(runtimeConfig);
    config.setPublicPath('/foo');
    return config;
}

describe('plugins/manifest', function() {
    it('default settings', function() {
        const config = createConfig();
        const plugins = [];

        manifestPluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).toBeInstanceOf(WebpackManifestPlugin);
        expect(plugins[0].plugin.options.fileName).toBe('manifest.json');
    });

    it('with options callback', function() {
        const config = createConfig();
        const plugins = [];

        config.configureManifestPlugin((options) => {
            options.fileName = 'bar';
        });

        manifestPluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).toBeInstanceOf(WebpackManifestPlugin);

        // Allows to override default options
        expect(plugins[0].plugin.options.fileName).toBe('bar');
    });

    it('with options callback that returns an object', function() {
        const config = createConfig();
        const plugins = [];

        config.configureManifestPlugin((options) => {
            options.fileName = 'bar';

            // This should override the original config
            return { foo: true };
        });

        manifestPluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).toBeInstanceOf(WebpackManifestPlugin);
        expect(plugins[0].plugin.options.fileName).toBe('manifest.json');
        expect(plugins[0].plugin.options.foo).toBe(true);
    });
});

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import webpack from 'webpack';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import definePluginUtil from '../../lib/plugins/define.js';

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/define', function() {
    it('dev environment', function() {
        const config = createConfig('dev');
        const plugins = [];

        definePluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).toBeInstanceOf(webpack.DefinePlugin);
        expect(plugins[0].plugin.definitions['process.env.NODE_ENV']).toBe(JSON.stringify('development'));
    });

    it('production environment with default settings', function() {
        const config = createConfig();
        const plugins = [];

        definePluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).toBeInstanceOf(webpack.DefinePlugin);
        expect(plugins[0].plugin.definitions['process.env.NODE_ENV']).toBe(JSON.stringify('production'));
    });

    it('production environment with options callback', function() {
        const config = createConfig();
        const plugins = [];

        config.configureDefinePlugin((options) => {
            options['foo'] = true;
            options['process.env.bar'] = true;
        });

        definePluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).toBeInstanceOf(webpack.DefinePlugin);

        // Allows to add new definitions
        expect(plugins[0].plugin.definitions.foo).toBe(true);
        expect(plugins[0].plugin.definitions['process.env.bar']).toBe(true);

        // Doesn't remove default definitions
        expect(plugins[0].plugin.definitions['process.env.NODE_ENV']).toBe(JSON.stringify('production'));
    });

    it('production environment with options callback that returns an object', function() {
        const config = createConfig();
        const plugins = [];

        config.configureDefinePlugin((options) => {
            options['bar'] = true;

            // This should override the original config
            return { foo: true };
        });

        definePluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).toBeInstanceOf(webpack.DefinePlugin);
        expect(plugins[0].plugin.definitions.bar).toBeUndefined();
        expect(plugins[0].plugin.definitions.foo).toBe(true);
    });
});

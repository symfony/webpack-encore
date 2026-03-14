/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import WebpackNotifier from 'webpack-notifier';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import notifierPluginUtil from '../../lib/plugins/notifier.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/notifier', function() {
    it('disabled by default', async function() {
        const config = createConfig();
        const plugins = [];

        await notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('explicitly disabled', async function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications(false);

        await notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('enabled with default settings', async function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications();

        await notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0].plugin.options.title).to.equal('Webpack Encore');
    });

    it('enabled with options callback', async function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications(true, (options) => {
            options.title = 'foo';
        });

        await notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0].plugin.options.title).to.equal('foo');
    });

    it('enabled with options callback that returns an object', async function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications(true, (options) => {
            options.title = 'foo';

            // This should override the original config
            return { foo: true };
        });

        await notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0].plugin.options.title).to.be.undefined;
        expect(plugins[0].plugin.options.foo).to.equal(true);
    });
});

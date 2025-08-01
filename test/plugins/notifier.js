/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const expect = require('chai').expect;
const WebpackNotifier = require('webpack-notifier');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const notifierPluginUtil = require('../../lib/plugins/notifier');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/notifier', function() {
    it('disabled by default', function() {
        const config = createConfig();
        const plugins = [];

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('explicitly disabled', function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications(false);

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('enabled with default settings', function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications();

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0].plugin.options.title).to.equal('Webpack Encore');
    });

    it('enabled with options callback', function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications(true, (options) => {
            options.title = 'foo';
        });

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0].plugin.options.title).to.equal('foo');
    });

    it('enabled with options callback that returns an object', function() {
        const config = createConfig();
        const plugins = [];

        config.enableBuildNotifications(true, (options) => {
            options.title = 'foo';

            // This should override the original config
            return { foo: true };
        });

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0].plugin.options.title).to.be.undefined;
        expect(plugins[0].plugin.options.foo).to.equal(true);
    });
});

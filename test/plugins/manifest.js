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
const ManifestPlugin = require('webpack-manifest-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const manifestPluginUtil = require('../../lib/plugins/manifest');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    const config = new WebpackConfig(runtimeConfig);
    config.setPublicPath('/foo');
    return config;
}

describe('plugins/manifest', () => {
    it('default settings', () => {
        const config = createConfig();
        const plugins = [];

        manifestPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(ManifestPlugin);
        expect(plugins[0].plugin.opts.fileName).to.equal('manifest.json');
    });

    it('with options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.configureManifestPlugin((options) => {
            options.fileName = 'bar';
        });

        manifestPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(ManifestPlugin);

        // Allows to override default options
        expect(plugins[0].plugin.opts.fileName).to.equal('bar');
    });

    it('with options callback that returns an object', () => {
        const config = createConfig();
        const plugins = [];

        config.configureManifestPlugin((options) => {
            options.fileName = 'bar';

            // This should override the original config
            return { foo: true };
        });

        manifestPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(ManifestPlugin);
        expect(plugins[0].plugin.opts.fileName).to.equal('manifest.json');
        expect(plugins[0].plugin.opts.foo).to.equal(true);
    });
});

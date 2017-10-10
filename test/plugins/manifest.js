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
const ManifestPlugin = require('../../lib/webpack/webpack-manifest-plugin');
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
        expect(plugins[0]).to.be.instanceof(ManifestPlugin);
        expect(plugins[0].opts.fileName).to.equal('manifest.json');
        expect(plugins[0].opts.publicPath).to.equal('/foo/');
    });

    it('with options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.configureManifestPlugin((options) => {
            options.fileName = 'bar';
        });

        manifestPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(ManifestPlugin);

        // Allows to override default options
        expect(plugins[0].opts.fileName).to.equal('bar');

        // Doesn't remove default options
        expect(plugins[0].opts.publicPath).to.equal('/foo/');
    });
});

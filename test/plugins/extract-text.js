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
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const extractTextPluginUtil = require('../../lib/plugins/extract-text');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/extract-text', () => {
    it('with default settings and versioning disabled', () => {
        const config = createConfig();
        const plugins = [];

        extractTextPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(ExtractTextPlugin);
        expect(plugins[0].plugin.filename).to.equal('[name].css');
        expect(plugins[0].plugin.options.allChunks).to.equal(false);
    });

    it('with default settings and versioning enabled', () => {
        const config = createConfig();
        const plugins = [];

        config.enableVersioning();

        extractTextPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(ExtractTextPlugin);
        expect(plugins[0].plugin.filename).to.equal('[name].[contenthash:8].css');
        expect(plugins[0].plugin.options.allChunks).to.equal(false);
    });

    it('with options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.configureExtractTextPlugin((options) => {
            options.disable = true;
            options.filename = 'bar';
        });

        extractTextPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(ExtractTextPlugin);

        // Allows to add new options
        expect(plugins[0].plugin.options.disable).to.equal(true);

        // Allows to override default options
        expect(plugins[0].plugin.filename).to.equal('bar');

        // Doesn't remove default options
        expect(plugins[0].plugin.options.allChunks).to.equal(false);
    });
});

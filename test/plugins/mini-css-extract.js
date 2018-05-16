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
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const miniCssExtractPluginUtil = require('../../lib/plugins/mini-css-extract');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/mini-css-extract', () => {
    it('with default settings and versioning disabled', () => {
        const config = createConfig();
        const plugins = [];

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0].plugin.options.filename).to.equal('[name].css');
    });

    it('with default settings and versioning enabled', () => {
        const config = createConfig();
        const plugins = [];

        config.enableVersioning();

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0].plugin.options.filename).to.equal('[name].[contenthash:8].css');
    });
});

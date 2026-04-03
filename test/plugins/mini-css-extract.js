/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect, beforeAll, afterAll, vi } from 'vitest';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import miniCssExtractPluginUtil from '../../lib/plugins/mini-css-extract.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/mini-css-extract', function() {
    it('with default settings and versioning disabled', function() {
        const config = createConfig();
        const plugins = [];

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0].plugin.options.filename).toBe('[name].css');
    });

    it('with default settings and versioning enabled', function() {
        const config = createConfig();
        const plugins = [];

        config.enableVersioning();

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0].plugin.options.filename).toBe('[name].[contenthash:8].css');
    });

    it('with CSS extraction disabled', function() {
        const config = createConfig();
        const plugins = [];

        config.disableCssExtraction();

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).toBe(0);
    });

    it('with options callback', function() {
        const config = createConfig();
        const plugins = [];

        config.configureMiniCssExtractPlugin(
            () => {},
            options => {
                options.filename = '[name].css';
            }
        );

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).toBe(1);
        expect(plugins[0].plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0].plugin.options.filename).toBe('[name].css');
    });
});

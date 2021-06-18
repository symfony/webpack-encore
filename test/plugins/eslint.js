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
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const eslintPluginUtil = require('../../lib/plugins/eslint');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/eslint', () => {
    it('disabled', () => {
        const config = createConfig();
        const plugins = [];

        eslintPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('enabled with default settings', () => {
        const config = createConfig();
        const plugins = [];

        config.enableEslintPlugin();

        eslintPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(EslintWebpackPlugin);
        expect(plugins[0].plugin.options.emitWarning).to.equal(true);
        expect(plugins[0].plugin.options.emitError).to.equal(true);
        expect(plugins[0].plugin.options.failOnError).to.equal(true);
        expect(plugins[0].plugin.options.extensions).to.deep.equal(['js', 'jsx']);
    });

    it('with options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.enableEslintPlugin((options) => {
            options.extensions.push('vue');
        });

        eslintPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(EslintWebpackPlugin);
        expect(plugins[0].plugin.options.emitWarning).to.equal(true);
        expect(plugins[0].plugin.options.emitError).to.equal(true);
        expect(plugins[0].plugin.options.failOnError).to.equal(true);
        expect(plugins[0].plugin.options.extensions).to.deep.equal(['js', 'jsx', 'vue']);
    });

    it('with options callback that returns an object', () => {
        const config = createConfig();
        const plugins = [];

        config.enableEslintPlugin((options) => {
            return {
                extensions: ['vue']
            };
        });

        eslintPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(EslintWebpackPlugin);
        expect(plugins[0].plugin.options.emitWarning).to.equal(true);
        expect(plugins[0].plugin.options.emitError).to.equal(true);
        expect(plugins[0].plugin.options.failOnError).to.equal(true);
        expect(plugins[0].plugin.options.extensions).to.deep.equal(['vue']);
    });
});

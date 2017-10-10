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
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const cleanPluginUtil = require('../../lib/plugins/clean');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/clean', () => {
    it('disabled', () => {
        const config = createConfig();
        const plugins = [];

        cleanPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('enabled with default settings', () => {
        const config = createConfig();
        const plugins = [];

        config.cleanupOutputBeforeBuild();

        cleanPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(CleanWebpackPlugin);
        expect(plugins[0].paths).to.deep.equal(['**/*']);
        expect(plugins[0].options.dry).to.equal(false);
    });

    it('enabled with custom paths and options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.cleanupOutputBeforeBuild();

        config.configureCleanWebpackPlugin(['**/*.js', '**/*.css'], (options) => {
            options.dry = true;
        });

        cleanPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(CleanWebpackPlugin);
        expect(plugins[0].paths).to.deep.equal(['**/*.js', '**/*.css']);
        expect(plugins[0].options.dry).to.equal(true);
    });
});

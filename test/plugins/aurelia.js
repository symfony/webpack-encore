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
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const aureliaPluginUtil = require('../../lib/plugins/aurelia');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}
describe('plugins/aurelia', () => {
    it('is disabled by default', () => {
        const config = createConfig();
        const plugins = [];

        aureliaPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('uses an options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.enableAureliaPlugin((options) => {
            options.aureliaApp = 'foo';
        });

        aureliaPluginUtil(plugins, config);

        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceOf(AureliaPlugin);

        // Ensure that the options were set
        expect(plugins[0].plugin.options.aureliaApp).to.equal('foo');
    });
});

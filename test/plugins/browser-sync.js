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
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/browser-sync', () => {
    it('getPlugins() basic usage', () => {
        const config = createConfig();
        config.enableBrowserSync(['./src/*.php']);

        expect(config.plugins).to.have.lengthOf(0);
        const browserSync = require('../../lib/plugins/browser-sync');
        browserSync(config.plugins,config);
        expect(config.plugins).to.have.lengthOf(1);
        const pluginInstance = config.plugins[0];
        expect(pluginInstance.plugin).to.be.an.instanceof(BrowserSyncPlugin);
        expect(pluginInstance.plugin.browserSyncOptions. port).to.equal('8080');
        expect(pluginInstance.plugin.browserSyncOptions. proxy).to.equal('http://localhost:8080');

        expect(pluginInstance.plugin.options.reload).to.equal(false);
        expect(pluginInstance.plugin.options.name).to.equal('bs-webpack-plugin');
    });

    it('getPlugins() default proxy port', () => {
        const config = createConfig();
        config.enableBrowserSync(['./src/*.php']);

        expect(config.plugins).to.have.lengthOf(0);
        const browserSync = require('../../lib/plugins/browser-sync');
        browserSync(config.plugins,config);
        expect(config.plugins).to.have.lengthOf(1);
        const pluginInstance = config.plugins[0];
        expect(pluginInstance.plugin).to.be.an.instanceof(BrowserSyncPlugin);
        expect(pluginInstance.plugin.browserSyncOptions. port).to.equal('80');
        expect(pluginInstance.plugin.browserSyncOptions. proxy).to.equal('http://local.dev');

        expect(pluginInstance.plugin.options.reload).to.equal(false);
        expect(pluginInstance.plugin.options.name).to.equal('bs-webpack-plugin');
    });
});

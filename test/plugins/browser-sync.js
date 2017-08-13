/*
<<<<<<< HEAD
 * This file is part of the Symfony Webpack Encore package.
=======
 * This file is part of the Symfony package.
>>>>>>> Add plugin tests
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
<<<<<<< HEAD
        config.enableBrowserSync(['./src/*.php']);
=======
        config.enableBrowserSync('http://localhost:8080', ['./src/*.php']);
>>>>>>> Add plugin tests

        expect(config.plugins).to.have.lengthOf(0);
        const browserSync = require('../../lib/plugins/browser-sync');
        browserSync(config.plugins,config);
        expect(config.plugins).to.have.lengthOf(1);
        const pluginInstance = config.plugins[0];
<<<<<<< HEAD
        expect(pluginInstance.plugin).to.be.an.instanceof(BrowserSyncPlugin);

        expect(pluginInstance.plugin.options.reload).to.equal(false);
        expect(pluginInstance.plugin.options.name).to.equal('bs-webpack-plugin');
=======
        expect(pluginInstance).to.be.an.instanceof(BrowserSyncPlugin);
        expect(pluginInstance.browserSyncOptions. port).to.equal('8080');
        expect(pluginInstance.browserSyncOptions. proxy).to.equal('http://localhost:8080');

        expect(pluginInstance.options.reload).to.equal(false);
        expect(pluginInstance.options.name).to.equal('bs-webpack-plugin');
>>>>>>> Add plugin tests
    });

    it('getPlugins() default proxy port', () => {
        const config = createConfig();
<<<<<<< HEAD
        config.enableBrowserSync(['./src/*.php']);
=======
        config.enableBrowserSync('http://local.dev', ['./src/*.php']);
>>>>>>> Add plugin tests

        expect(config.plugins).to.have.lengthOf(0);
        const browserSync = require('../../lib/plugins/browser-sync');
        browserSync(config.plugins,config);
        expect(config.plugins).to.have.lengthOf(1);
        const pluginInstance = config.plugins[0];
<<<<<<< HEAD
        expect(pluginInstance.plugin).to.be.an.instanceof(BrowserSyncPlugin);

        expect(pluginInstance.plugin.options.reload).to.equal(false);
        expect(pluginInstance.plugin.options.name).to.equal('bs-webpack-plugin');
=======
        expect(pluginInstance).to.be.an.instanceof(BrowserSyncPlugin);
        expect(pluginInstance.browserSyncOptions. port).to.equal('80');
        expect(pluginInstance.browserSyncOptions. proxy).to.equal('http://local.dev');

        expect(pluginInstance.options.reload).to.equal(false);
        expect(pluginInstance.options.name).to.equal('bs-webpack-plugin');
>>>>>>> Add plugin tests
    });
});

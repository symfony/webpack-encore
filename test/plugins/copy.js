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
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const copyPluginUtil = require('../../lib/plugins/copy');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

// Since "new CopyWebpackPlugin(...)" doesn't return an instance
// of CopyWebpackPlugin we have to replace the usual instanceof
// checks by something else. In this case, we can compare the actual
// code of the "apply" function that is returned by the plugin.
const copyWebpackPluginApply = new CopyWebpackPlugin(['foo.txt']).apply.toString();

describe('plugins/copy', () => {
    it('no instance by default', () => {
        const config = createConfig();
        const plugins = [];

        copyPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('with a single instance', () => {
        const config = createConfig();
        const plugins = [];

        config.copyFiles(['foo.txt']);

        copyPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin.apply.toString()).to.equal(copyWebpackPluginApply);
    });

    it('with multiple instances', () => {
        const config = createConfig();
        const plugins = [];

        config.copyFiles(['foo.txt']);
        config.copyFiles(['bar.txt']);

        copyPluginUtil(plugins, config);
        expect(plugins.length).to.equal(2);
        expect(plugins[0].plugin.apply.toString()).to.equal(copyWebpackPluginApply);
        expect(plugins[1].plugin.apply.toString()).to.equal(copyWebpackPluginApply);
    });

    it('with an options callback', () => {
        const config = createConfig();
        const plugins = [];

        let callbackCalled = false;

        config.copyFiles(['foo.txt'], (options) => {
            callbackCalled = true;
        });

        copyPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin.apply.toString()).to.equal(copyWebpackPluginApply);

        // We can't directly check if the options of the CopyWebpackPlugin
        // have been set using the given callback because they are directly
        // bound to the apply closure. Instead we just verify that the callback
        // has been called and let functional tests confirm that we can actually
        // override the plugin options.
        expect(callbackCalled).to.equal(true);
    });
});

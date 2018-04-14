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
const webpack = require('webpack');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const loaderOptionsPluginUtil = require('../../lib/plugins/loader-options');

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/loader-options', () => {
    it('dev environment with default settings', () => {
        const config = createConfig('dev');
        const plugins = [];

        loaderOptionsPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(webpack.LoaderOptionsPlugin);
        expect(plugins[0].plugin.options.debug).to.equal(true);
    });

    it('production environment with default settings', () => {
        const config = createConfig();
        const plugins = [];

        loaderOptionsPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(webpack.LoaderOptionsPlugin);
        expect(plugins[0].plugin.options.debug).to.equal(false);
    });

    it('production environment with options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.configureLoaderOptionsPlugin((options) => {
            options.debug = true;
        });

        loaderOptionsPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(webpack.LoaderOptionsPlugin);

        // Allows to override default options
        expect(plugins[0].plugin.options.debug).to.equal(true);

        // Doesn't remove default options
        expect(plugins[0].plugin.options.options.context).to.equal(config.getContext());
    });

    it('production environment with options callback that returns an object', () => {
        const config = createConfig();
        const plugins = [];

        config.configureLoaderOptionsPlugin((options) => {
            options.debug = true;

            // This should override the original config
            return { foo: true };
        });

        loaderOptionsPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0].plugin).to.be.instanceof(webpack.LoaderOptionsPlugin);
        expect(plugins[0].plugin.options.debug).to.be.undefined;
        expect(plugins[0].plugin.options.foo).to.equal(true);
    });
});

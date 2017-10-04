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
const definePluginUtil = require('../../lib/plugins/define');

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/define', () => {
    it('dev environment', () => {
        const config = createConfig('dev');
        const plugins = [];

        definePluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(webpack.DefinePlugin);
        expect(plugins[0].definitions['process.env'].NODE_ENV).to.equal(JSON.stringify('development'));
    });

    it('production environment with default settings', () => {
        const config = createConfig();
        const plugins = [];

        definePluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(webpack.DefinePlugin);
        expect(plugins[0].definitions['process.env'].NODE_ENV).to.equal(JSON.stringify('production'));
    });

    it('production environment with options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.configureDefinePlugin((options) => {
            options['foo'] = true;
            options['process.env'].bar = true;
        });

        definePluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(webpack.DefinePlugin);

        // Allows to add new definitions
        expect(plugins[0].definitions.foo).to.equal(true);
        expect(plugins[0].definitions['process.env'].bar).to.equal(true);

        // Doesn't remove default definitions
        expect(plugins[0].definitions['process.env'].NODE_ENV).to.equal(JSON.stringify('production'));
    });
});

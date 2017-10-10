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
const uglifyPluginUtil = require('../../lib/plugins/uglify');

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/uglify', () => {
    it('dev environment default settings', () => {
        const config = createConfig('dev');
        const plugins = [];

        uglifyPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('production environment default settings', () => {
        const config = createConfig();
        const plugins = [];

        uglifyPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(webpack.optimize.UglifyJsPlugin);
        expect(plugins[0].options.sourceMap).to.equal(false);
    });

    it('with options callback', () => {
        const config = createConfig();
        const plugins = [];

        config.configureUglifyJsPlugin((options) => {
            options.beautify = true;
        });

        uglifyPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]).to.be.instanceof(webpack.optimize.UglifyJsPlugin);

        // Allows to override default options
        expect(plugins[0].options.beautify).to.equal(true);

        // Doesn't remove default options
        expect(plugins[0].options.sourceMap).to.equal(false);
    });
});

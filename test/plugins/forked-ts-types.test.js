/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import { describe, it, expect } from 'vitest';
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const tsLoader = require('../../lib/loaders/typescript');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/forkedtypecheck', () => {
    it('getPlugins() basic usage', () => {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking();

        expect(config.plugins).to.have.lengthOf(0);
        const tsTypeChecker = require('../../lib/plugins/forked-ts-types');
        tsTypeChecker(config);
        expect(config.plugins).to.have.lengthOf(1);
        expect(config.plugins[0].plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0].plugin.options.silent).to.be.undefined;
        // after enabling plugin, check typescript loader has right config
        const actualLoaders = tsLoader.getLoaders(config);
        expect(actualLoaders[1].options.transpileOnly).to.be.true;
    });

    it('getPlugins() with options callback', () => {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking(function(options) {
            options.async = true;
        });

        expect(config.plugins).to.have.lengthOf(0);
        const tsTypeChecker = require('../../lib/plugins/forked-ts-types');
        tsTypeChecker(config);
        expect(config.plugins).to.have.lengthOf(1);
        expect(config.plugins[0].plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0].plugin.options.async).to.equal(true);
    });

    it('getPlugins() with options callback that returns an object', () => {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking(function(options) {
            options.silent = true;

            // This should override the original config
            return { async: true };
        });

        expect(config.plugins).to.have.lengthOf(0);
        const tsTypeChecker = require('../../lib/plugins/forked-ts-types');
        tsTypeChecker(config);
        expect(config.plugins).to.have.lengthOf(1);
        expect(config.plugins[0].plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0].plugin.options.silent).to.be.undefined;
        expect(config.plugins[0].plugin.options.async).to.equal(true);
    });
});

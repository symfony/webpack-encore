/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { describe, it, expect } from 'vitest';

import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import tsLoader from '../../lib/loaders/typescript.js';
import tsTypeChecker from '../../lib/plugins/forked-ts-types.js';
import WebpackConfig from '../../lib/WebpackConfig.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/forkedtypecheck', function () {
    it('getPlugins() basic usage', async function () {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking();

        expect(config.plugins).toHaveLength(0);
        tsTypeChecker(config);
        expect(config.plugins).toHaveLength(1);
        expect(config.plugins[0].plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0].plugin.options.silent).toBeUndefined();
        // after enabling plugin, check typescript loader has right config
        const actualLoaders = await tsLoader.getLoaders(config);
        expect(actualLoaders[1].options.transpileOnly).toBe(true);
    });

    it('getPlugins() with options callback', function () {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking(function (options) {
            options.async = true;
        });

        expect(config.plugins).toHaveLength(0);
        tsTypeChecker(config);
        expect(config.plugins).toHaveLength(1);
        expect(config.plugins[0].plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0].plugin.options.async).toBe(true);
    });

    it('getPlugins() with options callback that returns an object', function () {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking(function (options) {
            options.silent = true;

            // This should override the original config
            return { async: true };
        });

        expect(config.plugins).toHaveLength(0);
        tsTypeChecker(config);
        expect(config.plugins).toHaveLength(1);
        expect(config.plugins[0].plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0].plugin.options.silent).toBeUndefined();
        expect(config.plugins[0].plugin.options.async).toBe(true);
    });
});

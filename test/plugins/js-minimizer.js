/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import MinimizerPlugin from 'minimizer-webpack-plugin';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import WebpackConfig from '../../lib/WebpackConfig.js';

const { checkJsMinifierPackages } = vi.hoisted(() => ({
    checkJsMinifierPackages: vi.fn(),
}));

vi.mock('../../lib/utils/minifier-check.js', () => ({
    checkJsMinifierPackages,
    checkCssMinifierPackages: vi.fn(),
}));

const { default: jsMinimizerPluginUtil } = await import('../../lib/plugins/js-minimizer.js');

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/js-minimizer', function () {
    beforeEach(() => checkJsMinifierPackages.mockReset());

    it('production environment default settings', function () {
        const config = createConfig();

        const plugin = jsMinimizerPluginUtil(config);
        expect(plugin).toBeInstanceOf(MinimizerPlugin);
        expect(plugin.options.parallel).toBe(true);
        expect(plugin.options.minimizer.implementation).toBe(MinimizerPlugin.terserMinify);
        expect(checkJsMinifierPackages).toHaveBeenCalledWith(MinimizerPlugin.terserMinify);
    });

    it('with options callback', function () {
        const config = createConfig();

        config.configureJsMinimizerPlugin((options) => {
            options.test = 'custom_test';
        });

        const plugin = jsMinimizerPluginUtil(config);
        expect(plugin.options.test).toBe('custom_test');
        expect(plugin.options.parallel).toBe(true);
    });

    it('with options callback that returns an object', function () {
        const config = createConfig();

        config.configureJsMinimizerPlugin((options) => {
            options.test = 'custom_test';
            return { parallel: false };
        });

        const plugin = jsMinimizerPluginUtil(config);
        expect(plugin.options.test).not.toBe('custom_test');
        expect(plugin.options.parallel).toBe(false);
    });

    it('exposes the MinimizerPlugin class as the second callback argument', function () {
        const config = createConfig();

        config.configureJsMinimizerPlugin((options, MinimizerPluginArg) => {
            options.minify = MinimizerPluginArg.uglifyJsMinify;
        });

        const plugin = jsMinimizerPluginUtil(config);
        expect(plugin.options.minimizer.implementation).toBe(MinimizerPlugin.uglifyJsMinify);
        expect(checkJsMinifierPackages).toHaveBeenCalledWith(MinimizerPlugin.uglifyJsMinify);
    });

    it('calls check with the configured minify function', function () {
        const config = createConfig();

        config.configureJsMinimizerPlugin((options) => {
            options.minify = MinimizerPlugin.uglifyJsMinify;
        });

        jsMinimizerPluginUtil(config);
        expect(checkJsMinifierPackages).toHaveBeenCalledWith(MinimizerPlugin.uglifyJsMinify);
    });
});

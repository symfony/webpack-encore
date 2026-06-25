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

const { checkCssMinifierPackages } = vi.hoisted(() => ({
    checkCssMinifierPackages: vi.fn(),
}));

vi.mock('../../lib/utils/minifier-check.ts', () => ({
    checkJsMinifierPackages: vi.fn(),
    checkCssMinifierPackages,
}));

const { default: cssMinimizerPluginUtil } = await import('../../lib/plugins/css-minimizer.js');

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/css-minimizer', function () {
    beforeEach(() => {
        checkCssMinifierPackages.mockReset();
        // Replicate real behavior: throw when no minifier is configured
        checkCssMinifierPackages.mockImplementation((minifyFn) => {
            if (!minifyFn) {
                throw new Error('CSS minification is enabled but no CSS minifier is configured.');
            }
        });
    });

    it('throws when no CSS minifier is configured', function () {
        const config = createConfig();
        expect(() => cssMinimizerPluginUtil(config)).toThrow(
            /CSS minification is enabled but no CSS minifier is configured/
        );
    });

    it('with lightningcss minifier configured', function () {
        const config = createConfig();
        config.configureCssMinimizerPlugin((options) => {
            options.minify = MinimizerPlugin.lightningCssMinify;
        });

        const plugin = cssMinimizerPluginUtil(config);
        expect(plugin).toBeInstanceOf(MinimizerPlugin);
        expect(plugin.options.test).toEqual(/\.css(\?.*)?$/i);
        expect(plugin.options.minimizer.implementation).toBe(MinimizerPlugin.lightningCssMinify);
        expect(checkCssMinifierPackages).toHaveBeenCalledWith(MinimizerPlugin.lightningCssMinify);
    });

    it('exposes the MinimizerPlugin class as the second callback argument', function () {
        const config = createConfig();
        config.configureCssMinimizerPlugin((options, MinimizerPluginArg) => {
            options.minify = MinimizerPluginArg.lightningCssMinify;
        });

        const plugin = cssMinimizerPluginUtil(config);
        expect(plugin.options.minimizer.implementation).toBe(MinimizerPlugin.lightningCssMinify);
        expect(checkCssMinifierPackages).toHaveBeenCalledWith(MinimizerPlugin.lightningCssMinify);
    });

    it('with options callback overriding defaults', function () {
        const config = createConfig();

        config.configureCssMinimizerPlugin((options) => {
            options.minify = MinimizerPlugin.lightningCssMinify;
            options.parallel = false;
        });

        const plugin = cssMinimizerPluginUtil(config);
        expect(plugin.options.parallel).toBe(false);
        expect(plugin.options.test).toEqual(/\.css(\?.*)?$/i);
        expect(plugin.options.minimizer.implementation).toBe(MinimizerPlugin.lightningCssMinify);
    });

    it('with options callback that returns an object', function () {
        const config = createConfig();

        config.configureCssMinimizerPlugin(() => {
            return { minify: MinimizerPlugin.lightningCssMinify };
        });

        const plugin = cssMinimizerPluginUtil(config);
        expect(plugin.options.minimizer.implementation).toBe(MinimizerPlugin.lightningCssMinify);
        expect(plugin.options.parallel).toBe(true);
    });

    it('calls check with the configured minify function', function () {
        const config = createConfig();
        config.configureCssMinimizerPlugin((options) => {
            options.minify = MinimizerPlugin.cssoMinify;
        });

        cssMinimizerPluginUtil(config);
        expect(checkCssMinifierPackages).toHaveBeenCalledWith(MinimizerPlugin.cssoMinify);
    });
});

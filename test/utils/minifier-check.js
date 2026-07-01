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

const { ensurePackagesExistAndAreCorrectVersion } = vi.hoisted(() => ({
    ensurePackagesExistAndAreCorrectVersion: vi.fn(),
}));

vi.mock('../../lib/features.ts', () => ({
    default: { ensurePackagesExistAndAreCorrectVersion },
}));

const { checkJsMinifierPackages, checkCssMinifierPackages } =
    await import('../../lib/utils/minifier-check.ts');

describe('utils/minifier-check', function () {
    beforeEach(() => ensurePackagesExistAndAreCorrectVersion.mockReset());

    describe('checkJsMinifierPackages', function () {
        it('does not check the bundled terser minifier', function () {
            checkJsMinifierPackages(MinimizerPlugin.terserMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).not.toHaveBeenCalled();
        });

        it('maps each JS minifier to its feature', function () {
            checkJsMinifierPackages(MinimizerPlugin.esbuildMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith(
                'minify-js-esbuild'
            );

            checkJsMinifierPackages(MinimizerPlugin.swcMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith('minify-js-swc');

            checkJsMinifierPackages(MinimizerPlugin.uglifyJsMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith(
                'minify-js-uglify'
            );
        });

        it('ignores an unknown minify function', function () {
            checkJsMinifierPackages(() => {});
            expect(ensurePackagesExistAndAreCorrectVersion).not.toHaveBeenCalled();
        });
    });

    describe('checkCssMinifierPackages', function () {
        it('throws when no minifier is configured', function () {
            expect(() => checkCssMinifierPackages(undefined)).toThrow(
                /no CSS minifier is configured/
            );
            expect(ensurePackagesExistAndAreCorrectVersion).not.toHaveBeenCalled();
        });

        it('maps each CSS minifier to its feature', function () {
            checkCssMinifierPackages(MinimizerPlugin.lightningCssMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith(
                'minify-css-lightningcss'
            );

            checkCssMinifierPackages(MinimizerPlugin.cssnanoMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith(
                'minify-css-cssnano'
            );

            checkCssMinifierPackages(MinimizerPlugin.cssoMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith('minify-css-csso');

            checkCssMinifierPackages(MinimizerPlugin.cleanCssMinify);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith(
                'minify-css-clean-css'
            );

            checkCssMinifierPackages(MinimizerPlugin.esbuildMinifyCss);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith(
                'minify-css-esbuild'
            );

            checkCssMinifierPackages(MinimizerPlugin.swcMinifyCss);
            expect(ensurePackagesExistAndAreCorrectVersion).toHaveBeenCalledWith('minify-css-swc');
        });

        it('ignores an unknown minify function', function () {
            checkCssMinifierPackages(() => {});
            expect(ensurePackagesExistAndAreCorrectVersion).not.toHaveBeenCalled();
        });
    });
});

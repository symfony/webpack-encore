/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import MinimizerPlugin from 'minimizer-webpack-plugin';

import Features from '../features.js';

const JS_MINIFIER_FEATURES = new Map([
    [MinimizerPlugin.esbuildMinify, 'minify-js-esbuild'],
    [MinimizerPlugin.swcMinify, 'minify-js-swc'],
    [MinimizerPlugin.uglifyJsMinify, 'minify-js-uglify'],
]);

const CSS_MINIFIER_FEATURES = new Map([
    [MinimizerPlugin.lightningCssMinify, 'minify-css-lightningcss'],
    [MinimizerPlugin.cssnanoMinify, 'minify-css-cssnano'],
    [MinimizerPlugin.cssoMinify, 'minify-css-csso'],
    [MinimizerPlugin.cleanCssMinify, 'minify-css-clean-css'],
    [MinimizerPlugin.esbuildMinifyCss, 'minify-css-esbuild'],
    [MinimizerPlugin.swcMinifyCss, 'minify-css-swc'],
]);

/**
 * @param {Function} minifyFn
 */
export function checkJsMinifierPackages(minifyFn) {
    const feature = JS_MINIFIER_FEATURES.get(minifyFn);
    if (!feature) {
        // terserMinify (bundled) or a custom function: nothing to install
        return;
    }

    Features.ensurePackagesExistAndAreCorrectVersion(feature);
}

/**
 * @param {Function|undefined} minifyFn
 */
export function checkCssMinifierPackages(minifyFn) {
    if (!minifyFn) {
        throw new Error(
            'CSS minification is enabled but no CSS minifier is configured. ' +
                'Install one of lightningcss / cssnano / csso / clean-css / esbuild / @swc/css and pass it via configureCssMinimizerPlugin(), e.g.:\n\n' +
                '    Encore.configureCssMinimizerPlugin((options, MinimizerPlugin) => {\n' +
                '        options.minify = MinimizerPlugin.lightningCssMinify;\n' +
                '    });\n'
        );
    }

    const feature = CSS_MINIFIER_FEATURES.get(minifyFn);
    if (!feature) {
        // custom function: nothing to install
        return;
    }

    Features.ensurePackagesExistAndAreCorrectVersion(feature);
}

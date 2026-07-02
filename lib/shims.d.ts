/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// The webpack / webpack-dev-server CLI entrypoints are imported for their side
// effects only (running the binary); they ship no type declarations for these
// subpaths, so declare them as ambient modules to satisfy the compiler.
declare module 'webpack/bin/webpack.js';
declare module 'webpack-dev-server/bin/webpack-dev-server.js';

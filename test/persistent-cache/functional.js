/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, chai } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
chai.use(require('chai-fs'));

import path from 'path';
import * as testSetup from '../helpers/setup.js';

function createWebpackConfig(outputDirName = '', testName, command, argv = {}) {
    // We need a static named test dir for the cache to work
    let testAppDir = testSetup.createTestAppDir(null, testName + '/test');
    const webpackConfig = testSetup.createWebpackConfig(
        testAppDir,
        outputDirName,
        command,
        argv,
    );

    webpackConfig.enableSingleRuntimeChunk();
    webpackConfig.enableBuildCache({ config: [import.meta.filename] }, (cache) => {
        cache.cacheDirectory = path.resolve(testAppDir, '..', '.webpack-cache');
    });

    return webpackConfig;
}

describe('Functional persistent cache tests using webpack', function() {
    // being functional tests, these can take quite long
    this.timeout(10000);

    describe('Basic scenarios.', function() {
        it('Persistent caching does not cause problems', async function() {
            const config = createWebpackConfig('www/build', 'basic_cache', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/code_splitting');

            const { webpackAssert } = await testSetup.runWebpack(config);
            // sanity check
            webpackAssert.assertManifestPath(
                'build/main.js',
                '/build/main.js',
            );
        });
    });

    describe('copyFiles() allows to copy files and folders', function() {
        it('Persistent caching does not cause problems', async function() {
            const config = createWebpackConfig('www/build', 'copy_files_cache', 'production');
            config.addEntry('main', './js/no_require');
            config.setPublicPath('/build');
            config.enableVersioning(true);
            config.copyFiles([{
                from: './images',
                includeSubdirectories: false,
            }]);

            const { webpackAssert } = await testSetup.runWebpack(config);
            webpackAssert.assertDirectoryContents([
                'entrypoints.json',
                'runtime.[hash:8].js',
                'main.[hash:8].js',
                'manifest.json',
                'symfony_logo.[hash:8].png',
                'symfony_logo_alt.[hash:8].png',
            ]);

            webpackAssert.assertManifestPath(
                'build/symfony_logo.png',
                '/build/symfony_logo.91beba37.png',
            );

            webpackAssert.assertManifestPath(
                'build/symfony_logo_alt.png',
                '/build/symfony_logo_alt.f880ba14.png',
            );
        });
    });
});

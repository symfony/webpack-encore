/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chai = require('chai');
chai.use(require('chai-fs'));
chai.use(require('chai-subset'));
const path = require('path');
const testSetup = require('../helpers/setup');

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
    webpackConfig.enableBuildCache({ config: [__filename] }, (cache) => {
        cache.cacheDirectory = path.resolve(testAppDir, '..', '.webpack-cache');
    });

    return webpackConfig;
}

describe('Functional persistent cache tests using webpack', function() {
    // being functional tests, these can take quite long
    this.timeout(10000);

    describe('Basic scenarios.', () => {
        it('Persistent caching does not cause problems', (done) => {
            const config = createWebpackConfig('www/build', 'basic_cache', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/code_splitting');

            testSetup.runWebpack(config, (webpackAssert) => {
                // sanity check
                webpackAssert.assertManifestPath(
                    'build/main.js',
                    '/build/main.js',
                );

                done();
            });
        });
    });

    describe('copyFiles() allows to copy files and folders', () => {
        it('Persistent caching does not cause problems', (done) => {
            const config = createWebpackConfig('www/build', 'copy_files_cache', 'production');
            config.addEntry('main', './js/no_require');
            config.setPublicPath('/build');
            config.enableVersioning(true);
            config.copyFiles([{
                from: './images',
                includeSubdirectories: false,
            }]);

            testSetup.runWebpack(config, (webpackAssert) => {
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

                done();
            });
        });
    });
});

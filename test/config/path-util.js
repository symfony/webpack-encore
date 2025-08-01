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
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');
const pathUtil = require('../../lib/config/path-util');
const process = require('process');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.environment = 'dev';
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

const isWindows = (process.platform === 'win32');

describe('path-util getContentBase()', function() {
    describe('getContentBase()', function() {
        it('contentBase is calculated correctly', function() {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.outputPath = isWindows ? 'C:\\tmp\\public\\build' : '/tmp/public/build';
            config.setPublicPath('/build/');
            config.addEntry('main', './main');

            const actualContentBase = pathUtil.getContentBase(config);
            // contentBase should point to the "document root", which
            // is calculated as outputPath, but without the publicPath portion
            expect(actualContentBase).to.equal(isWindows ? 'C:\\tmp\\public' : '/tmp/public');
        });

        it('contentBase works ok with manifestKeyPrefix', function() {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.outputPath = isWindows ? 'C:\\tmp\\public\\build' : '/tmp/public/build';
            config.setPublicPath('/subdirectory/build');
            // this "fixes" the incompatibility between outputPath and publicPath
            config.setManifestKeyPrefix('/build/');
            config.addEntry('main', './main');

            const actualContentBase = pathUtil.getContentBase(config);
            expect(actualContentBase).to.equal(isWindows ? 'C:\\tmp\\public' : '/tmp/public');
        });

        it('contentBase is calculated correctly with no public path', function() {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;
            config.outputPath = isWindows ? 'C:\\tmp\\public' : '/tmp/public';
            config.setPublicPath('/');
            config.addEntry('main', './main');

            const actualContentBase = pathUtil.getContentBase(config);
            // contentBase should point to the "document root", which
            // is calculated as outputPath, but without the publicPath portion
            expect(actualContentBase).to.equal(isWindows ? 'C:\\tmp\\public' : '/tmp/public');
        });
    });

    describe('validatePublicPathAndManifestKeyPrefix', function() {
        it('manifestKeyPrefix is correctly not required on windows', function() {
            const config = createConfig();
            config.outputPath = 'C:\\projects\\webpack-encore\\web\\build';
            config.setPublicPath('/build/');
            config.addEntry('main', './main');

            // NOT throwing an error is the assertion
            pathUtil.validatePublicPathAndManifestKeyPrefix(config);
        });

        it('with absolute publicPath, manifestKeyPrefix must be set', function() {
            const config = createConfig();
            config.outputPath = '/tmp/public/build';
            config.setPublicPath('/build');
            config.addEntry('main', './main');
            config.setPublicPath('https://cdn.example.com');

            expect(() => {
                pathUtil.validatePublicPathAndManifestKeyPrefix(config);
            }).to.throw('Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. build/) to use');
        });

        it('when outputPath and publicPath are incompatible, manifestKeyPrefix must be set', function() {
            const config = createConfig();

            config.outputPath = isWindows ? 'C:\\tmp\\public\\build' : '/tmp/public/build';
            config.addEntry('main', './main');
            // pretend we're installed to a subdirectory
            config.setPublicPath('/subdirectory/build');

            expect(() => {
                pathUtil.validatePublicPathAndManifestKeyPrefix(config);
            }).to.throw('Cannot determine how to prefix the keys in manifest.json. Call Encore.setManifestKeyPrefix() to choose what path (e.g. build/) to use');
        });
    });

    describe('getRelativeOutputPath', function() {
        it('basic usage', function() {
            const config = createConfig();
            if (isWindows) {
                config.runtimeConfig.context = 'C:\\projects\\webpack-encore';
                config.outputPath = 'C:\\projects\\webpack-encore\\public\\build';
            } else {
                config.runtimeConfig.context = '/tmp/webpack-encore';
                config.outputPath = '/tmp/webpack-encore/public/build';
            }

            const actualPath = pathUtil.getRelativeOutputPath(config);
            expect(actualPath).to.equal(isWindows ? 'public\\build' : 'public/build');
        });
    });

    describe('calculateDevServerUrl', function() {
        it('no https, no public', function() {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.devServerFinalIsHttps = false;
            runtimeConfig.devServerPublic = false;
            runtimeConfig.devServerHost = 'localhost';
            runtimeConfig.devServerPort = '8080';

            expect(pathUtil.calculateDevServerUrl(runtimeConfig)).to.equal('http://localhost:8080');
        });

        it('yes https, no public', function() {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.devServerFinalIsHttps = true;
            runtimeConfig.devServerPublic = false;
            runtimeConfig.devServerHost = 'localhost';
            runtimeConfig.devServerPort = '8080';

            expect(pathUtil.calculateDevServerUrl(runtimeConfig)).to.equal('https://localhost:8080');
        });

        it('no https, yes public not absolute', function() {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.devServerFinalIsHttps = false;
            runtimeConfig.devServerPublic = 'myhost.local:9090';

            expect(pathUtil.calculateDevServerUrl(runtimeConfig)).to.equal('http://myhost.local:9090');
        });

        it('yes https, yes public not absolute', function() {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.devServerFinalIsHttps = true;
            runtimeConfig.devServerPublic = 'myhost.local:9090';

            expect(pathUtil.calculateDevServerUrl(runtimeConfig)).to.equal('https://myhost.local:9090');
        });

        it('yes public and is absolute', function() {
            const runtimeConfig = new RuntimeConfig();
            runtimeConfig.devServerFinalIsHttps = false;
            runtimeConfig.devServerPublic = 'https://myhost.local:9090';

            expect(pathUtil.calculateDevServerUrl(runtimeConfig)).to.equal('https://myhost.local:9090');
        });
    });
});

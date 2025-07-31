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
const validator = require('../../lib/config/validator');
const logger = require('../../lib/logger');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('The validator function', function() {
    function CustomPlugin1() {}

    it('throws an error if there are no entries', function() {
        const config = createConfig();
        config.publicPath = '/';
        config.outputPath = '/tmp';

        expect(() => {
            validator(config);
        }).to.throw('No entries found!');
    });

    it('should accept use with copyFiles() only', function() {
        const config = createConfig();
        config.setOutputPath('/tmp');
        config.setPublicPath('/tmp');
        config.copyFiles({ from: './' });

        expect(() => {
            validator(config);
        }).not.throw();

        expect(Object.keys(config.copyFilesConfigs).length).to.equal(1);
    });

    it('should accept use with addPlugin() only', function() {
        const config = createConfig();
        config.setOutputPath('/tmp');
        config.setPublicPath('/tmp');
        config.addPlugin(new CustomPlugin1());

        expect(() => {
            validator(config);
        }).not.throw();
    });

    it('throws an error if there is no output path', function() {
        const config = createConfig();
        config.publicPath = '/';
        config.addEntry('main', './main');

        expect(() => {
            validator(config);
        }).to.throw('Missing output path');
    });

    it('throws an error if there is no public path', function() {
        const config = createConfig();
        config.outputPath = '/tmp';
        config.addEntry('main', './main');

        expect(() => {
            validator(config);
        }).to.throw('Missing public path');
    });

    it('cannot use versioning with webpack-dev-server', function() {
        const config = createConfig();
        config.outputPath = '/tmp/public/build';
        config.setPublicPath('/build');
        config.addEntry('main', './main');
        config.runtimeConfig.useDevServer = true;
        config.enableVersioning();

        expect(() => {
            validator(config);
        }).to.throw('Don\'t enable versioning with the dev-server');
    });

    it('warning with dev-server and absolute publicPath', function() {
        const config = createConfig();
        config.outputPath = '/tmp/public/build';
        config.setPublicPath('https://absoluteurl.com/build');
        config.setManifestKeyPrefix('build/');
        config.addEntry('main', './main');
        config.runtimeConfig.useDevServer = true;

        logger.reset();
        logger.quiet();
        validator(config);

        expect(logger.getMessages().warning).to.have.lengthOf(1);
        expect(logger.getMessages().warning[0]).to.include('Passing an absolute URL to setPublicPath() *and* using the dev-server can cause issues');
    });

    it('warning with addCacheGroup() and core cache group name', function() {
        const config = createConfig();
        config.outputPath = '/tmp/public/build';
        config.setPublicPath('/build');
        config.addEntry('main', './main');
        config.addCacheGroup('defaultVendors', {
            test: /[\\/]main/,
        });

        logger.reset();
        logger.quiet();
        validator(config);

        expect(logger.getMessages().warning).to.have.lengthOf(1);
        expect(logger.getMessages().warning[0]).to.include('Passing "defaultVendors" to addCacheGroup() is not recommended');
    });
});

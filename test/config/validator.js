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

describe('The validator function', () => {
    it('throws an error if there are no entries', () => {
        const config = createConfig();
        config.publicPath = '/';
        config.outputPath = '/tmp';

        expect(() => {
            validator(config);
        }).to.throw('No entries found!');
    });

    it('should accept use with copyFiles() only', () => {
        const config = createConfig();
        config.setOutputPath('/tmp');
        config.setPublicPath('/tmp');
        config.copyFiles({ from: './' });

        expect(() => {
            validator(config);
        }).not.throw();

        expect(Object.keys(config.copyFilesConfigs).length).to.equal(1);
    });

    it('throws an error if there is no output path', () => {
        const config = createConfig();
        config.publicPath = '/';
        config.addEntry('main', './main');

        expect(() => {
            validator(config);
        }).to.throw('Missing output path');
    });

    it('throws an error if there is no public path', () => {
        const config = createConfig();
        config.outputPath = '/tmp';
        config.addEntry('main', './main');

        expect(() => {
            validator(config);
        }).to.throw('Missing public path');
    });

    it('cannot use versioning with webpack-dev-server', () => {
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

    it('warning with dev-server and absolute publicPath', () => {
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

    it('warning with createSharedEntry() and core cache group name', () => {
        const config = createConfig();
        config.outputPath = '/tmp/public/build';
        config.setPublicPath('/build');
        config.createSharedEntry('vendors', './main');

        logger.reset();
        logger.quiet();
        validator(config);

        expect(logger.getMessages().warning).to.have.lengthOf(1);
        expect(logger.getMessages().warning[0]).to.include('Passing "vendors" to createSharedEntry() is not recommended');
    });

    it('warning with addCacheGroup() and core cache group name', () => {
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

    it('warning with addCacheGroup() and a similar createSharedEntry() name', () => {
        const config = createConfig();
        config.outputPath = '/tmp/public/build';
        config.setPublicPath('/build');
        config.addEntry('main', './main');
        config.createSharedEntry('foo', './foo.js');
        config.addCacheGroup('foo', {
            test: /[\\/]main/,
        });

        logger.reset();
        logger.quiet();
        validator(config);

        expect(logger.getMessages().warning).to.have.lengthOf(1);
        expect(logger.getMessages().warning[0]).to.include('Using the same name when calling createSharedEntry() and addCacheGroup() is not recommended.');
    });
});

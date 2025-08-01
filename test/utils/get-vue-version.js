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
const getVueVersion = require('../../lib/utils/get-vue-version');
const sinon = require('sinon');
const packageHelper = require('../../lib/package-helper');
const WebpackConfig = require('../../lib/WebpackConfig');
const RuntimeConfig = require('../../lib/config/RuntimeConfig');

const createWebpackConfig = function() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.environment = 'dev';
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
};

describe('get-vue-version', function() {
    let getPackageVersionStub = null;

    before(function() {
        getPackageVersionStub = sinon.stub(packageHelper, 'getPackageVersion');
    });

    after(function() {
        packageHelper.getPackageVersion.restore();
    });

    it('returns the value configured in Webpack.config.js', function() {
        const config = createWebpackConfig();
        config.vueOptions.version = 4;

        expect(getVueVersion(config)).to.equal(4);
    });

    it('returns the default recommended version when vue is not installed', function() {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => null);

        expect(getVueVersion(config)).to.equal(3);
    });

    it('throw an error when Vue 2 is installed', function() {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '2.2.4');

        expect(() => getVueVersion(config)).to.throw('vue version 2 is not supported.');
    });

    it('returns 3 when Vue 3 beta is installed', function() {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '3.0.0-beta.9');

        expect(getVueVersion(config)).to.equal(3);
    });

    it('returns 3 when Vue 3 is installed', function() {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '3.0.0');

        expect(getVueVersion(config)).to.equal(3);
    });

    it('returns 3 when a version is too new', function() {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '4.0.0'); // unsupported version

        expect(getVueVersion(config)).to.equal(3);
    });
});

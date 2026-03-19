/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import getVueVersion from '../../lib/utils/get-vue-version.js';
import sinon from 'sinon';
import packageHelper from '../../lib/package-helper.js';
import WebpackConfig from '../../lib/WebpackConfig.js';
import RuntimeConfig from '../../lib/config/RuntimeConfig.js';

const createWebpackConfig = function() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
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

        expect(() => getVueVersion(config)).to.throw('The support for Vue 2 has been removed.');
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

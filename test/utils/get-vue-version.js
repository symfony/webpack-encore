/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect, vi } from 'vitest';
import getVueVersion from '../../lib/utils/get-vue-version.js';

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
    it('returns the value configured in Webpack.config.js', function() {
        const config = createWebpackConfig();
        config.vueOptions.version = 4;

        expect(getVueVersion(config)).toBe(4);
    });

    it('returns the default recommended version when vue is not installed', function() {
        const config = createWebpackConfig();
        const getPackageVersionStub = vi.spyOn(packageHelper, 'getPackageVersion')
            .mockImplementation(() => null);

        expect(getVueVersion(config)).toBe(3);
        getPackageVersionStub.mockRestore();
    });

    it('throw an error when Vue 2 is installed', function() {
        const config = createWebpackConfig();
        const getPackageVersionStub = vi.spyOn(packageHelper, 'getPackageVersion')
            .mockImplementation(() => '2.2.4');

        expect(() => getVueVersion(config)).toThrow(/The support for Vue 2 has been removed/);
        getPackageVersionStub.mockRestore();
    });

    it('returns 3 when Vue 3 beta is installed', function() {
        const config = createWebpackConfig();
        const getPackageVersionStub = vi.spyOn(packageHelper, 'getPackageVersion')
            .mockImplementation(() => '3.0.0-beta.9');

        expect(getVueVersion(config)).toBe(3);
        getPackageVersionStub.mockRestore();
    });

    it('returns 3 when Vue 3 is installed', function() {
        const config = createWebpackConfig();
        const getPackageVersionStub = vi.spyOn(packageHelper, 'getPackageVersion')
            .mockImplementation(() => '3.0.0');

        expect(getVueVersion(config)).toBe(3);
        getPackageVersionStub.mockRestore();
    });

    it('returns 3 when a version is too new', function() {
        const config = createWebpackConfig();
        const getPackageVersionStub = vi.spyOn(packageHelper, 'getPackageVersion')
            .mockImplementation(() => '4.0.0'); // unsupported version

        expect(getVueVersion(config)).toBe(3);
        getPackageVersionStub.mockRestore();
    });
});

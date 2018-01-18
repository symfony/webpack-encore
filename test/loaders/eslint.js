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
const eslintLoader = require('../../lib/loaders/eslint');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/eslint', () => {
    it('getOptions() full usage', () => {
        const config = createConfig();
        config.enableEslintLoader();
        const actualOptions = eslintLoader.getOptions(config);

        expect(Object.keys(actualOptions)).to.have.lengthOf(3);
    });

    it('getOptions() with extra options', () => {
        const config = createConfig();
        config.enableEslintLoader((options) => {
            options.extends = 'airbnb';
        });

        const actualOptions = eslintLoader.getOptions(config);

        expect(Object.keys(actualOptions)).to.have.lengthOf(4);
        expect(actualOptions.extends).to.equal('airbnb');
    });

    it('getOptions() with an overridden option', () => {
        const config = createConfig();
        config.enableEslintLoader((options) => {
            options.emitWarning = false;
        });

        const actualOptions = eslintLoader.getOptions(config);

        expect(Object.keys(actualOptions)).to.have.lengthOf(3);
        expect(actualOptions.emitWarning).to.equal(false);
    });
});

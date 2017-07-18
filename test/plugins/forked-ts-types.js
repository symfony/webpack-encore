/*
 * This file is part of the Symfony package.
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
const tsLoader = require('../../lib/loaders/typescript');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/forkedtypecheck', () => {
    it('getPlugins() basic usage', () => {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking();

        const tsTypeChecker = require('../../lib/plugins/forked-ts-types');
        const actualPlugins = tsTypeChecker.getPlugins(config);
        expect(actualPlugins).to.have.lengthOf(1);
        // after enabling plugin, check typescript loader has right config
        const actualLoaders = tsLoader.getLoaders(config);
        expect(actualLoaders[1].options.transpileOnly).to.be.true;
    });
});

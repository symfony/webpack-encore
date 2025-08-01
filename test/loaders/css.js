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
const cssLoader = require('../../lib/loaders/css');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/css', function() {
    it('getLoaders() basic usage', function() {
        const config = createConfig();
        config.enableSourceMaps(true);

        const actualLoaders = cssLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.sourceMap).to.be.true;
        expect(actualLoaders[0].options.modules).to.be.false;
    });

    it('getLoaders() for production', function() {
        const config = createConfig();
        config.enableSourceMaps(false);
        config.runtimeConfig.environment = 'production';

        const actualLoaders = cssLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.sourceMap).to.be.false;
        expect(actualLoaders[0].options.modules).to.be.false;
    });

    it('getLoaders() with options callback', function() {
        const config = createConfig();

        config.configureCssLoader(function(options) {
            options.foo = true;
            options.url = false;
        });

        const actualLoaders = cssLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.foo).to.be.true;
        expect(actualLoaders[0].options.url).to.be.false;
        expect(actualLoaders[0].options.modules).to.be.false;
    });

    it('getLoaders() with CSS modules enabled', function() {
        const config = createConfig();

        config.configureCssLoader(function(options) {
            options.foo = true;
            options.url = false;
        });

        const actualLoaders = cssLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0].options.foo).to.be.true;
        expect(actualLoaders[0].options.url).to.be.false;
        expect(actualLoaders[0].options.modules).to.deep.equals({
            localIdentName: '[local]_[hash:base64:5]',
        });
    });

    describe('getLoaders() with PostCSS', function() {
        it('without options callback', function() {
            const config = createConfig();
            config.enableSourceMaps();
            config.enablePostCssLoader();

            const actualLoaders = cssLoader.getLoaders(config);
            // css-loader & postcss-loader
            expect(actualLoaders).to.have.lengthOf(2);
            expect(actualLoaders[1].options.sourceMap).to.be.true;
        });

        it('with options callback', function() {
            const config = createConfig();
            config.enableSourceMaps();
            config.enablePostCssLoader((options) => {
                options.config = {
                    path: 'config/postcss.config.js'
                };
            });

            const actualLoaders = cssLoader.getLoaders(config);
            // css-loader & postcss-loader
            expect(actualLoaders).to.have.lengthOf(2);
            expect(actualLoaders[1].options.sourceMap).to.be.true;
            expect(actualLoaders[1].options.config.path).to.equal('config/postcss.config.js');
        });

        it('with options callback that returns an object', function() {
            const config = createConfig();
            config.enableSourceMaps(true);
            config.enablePostCssLoader((options) => {
                options.config = {
                    path: 'config/postcss.config.js'
                };

                // This should override the original config
                return { foo: true };
            });

            const actualLoaders = cssLoader.getLoaders(config);
            // css-loader & postcss-loader
            expect(actualLoaders).to.have.lengthOf(2);
            expect(actualLoaders[1].options).to.deep.equal({ foo: true });
        });
    });
});

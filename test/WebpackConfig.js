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
const WebpackConfig = require('../lib/WebpackConfig');
const RuntimeConfig = require('../lib/config/RuntimeConfig');
const path = require('path');
const fs = require('fs');

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('WebpackConfig object', () => {

    describe('setOutputPath', () => {
        it('use absolute, existent path', () => {
            const config = createConfig();
            config.setOutputPath(__dirname);

            expect(config.outputPath).to.equal(__dirname);
        });

        it('relative path, becomes absolute', () => {
            const config = createConfig();
            config.setOutputPath('assets');

            // __dirname is the context
            expect(config.outputPath).to.equal(
                path.join(__dirname, '/assets')
            );

            // cleanup!
            fs.rmdirSync(path.join(__dirname, '/assets'));
        });

        it('non-existent path creates directory', () => {
            const targetPath = path.join(__dirname, 'new_dir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            config.setOutputPath(targetPath);

            expect(fs.existsSync(config.outputPath)).to.be.true;

            // cleanup!
            fs.rmdirSync(targetPath);
        });

        it('non-existent directory, 2 levels deep throws error', () => {
            var targetPath = path.join(__dirname, 'new_dir', 'subdir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            const config = createConfig();
            expect(() => {
                config.setOutputPath(targetPath);
            }).to.throw('create this directory');
        });
    });

    describe('setPublicPath', () => {
        it('/foo => /foo/', () => {
            const config = createConfig();
            config.setPublicPath('/foo');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('/foo/ => /foo/', () => {
            const config = createConfig();
            config.setPublicPath('/foo/');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('https://example.com => https://example.com/', () => {
            const config = createConfig();
            config.setPublicPath('https://example.com');

            expect(config.publicPath).to.equal('https://example.com/');
        });

        it('foo/ throws an exception', () => {
            const config = createConfig();

            expect(() => {
                config.setPublicPath('foo/');
            }).to.throw('The value passed to setPublicPath() must start with "/"');
        });

        it('Setting to a URL when using devServer throws an error', () => {
            const config = createConfig();
            config.runtimeConfig.useDevServer = true;

            expect(() => {
                config.setPublicPath('https://examplecdn.com');
            }).to.throw('You cannot pass an absolute URL to setPublicPath() and use the dev-server');
        });
    });

    describe('setManifestKeyPrefix', () => {

        it('You can set it!', () => {
            const config = createConfig();
            config.setManifestKeyPrefix('/foo');

            // trailing slash added
            expect(config.manifestKeyPrefix).to.equal('/foo/');
        });

        it('You can set it blank', () => {
            const config = createConfig();
            config.setManifestKeyPrefix('');

            // trailing slash not added
            expect(config.manifestKeyPrefix).to.equal('');
        });
    });

    describe('addEntry', () => {
        it('Calling with a duplicate name throws an error', () => {
            const config = createConfig();
            config.addEntry('entry_foo', './foo.js');

            expect(() => {
                config.addEntry('entry_foo', './bar.js');
            }).to.throw('Duplicate name');
        });

        it('Calling with a duplicate of addStyleEntry', () => {
            const config = createConfig();
            config.addStyleEntry('main', './main.scss');

            expect(() => {
                config.addEntry('main', './main.js');
            }).to.throw('conflicts with a name passed to addStyleEntry');
        });
    });

    describe('addStyleEntry', () => {
        it('Calling with a duplicate name throws an error', () => {
            const config = createConfig();
            config.addStyleEntry('entry_foo', './foo.css');

            expect(() => {
                config.addStyleEntry('entry_foo', './bar.css');
            }).to.throw('Duplicate name');
        });

        it('Calling with a duplicate of addEntry', () => {
            const config = createConfig();
            config.addEntry('main', './main.scss');

            expect(() => {
                config.addStyleEntry('main', './main.js');
            }).to.throw('conflicts with a name passed to addEntry');
        });
    });

    describe('createSharedEntry', () => {
        it('Calling twice throws an error', () => {
            const config = createConfig();
            config.createSharedEntry('vendor', 'jquery');

            expect(() => {
                config.createSharedEntry('vendor2', './main');
            }).to.throw('cannot be called multiple');
        });
    });

    describe('autoProvideVariables', () => {
        it('Calling multiple times merges', () => {
            const config = createConfig();
            config.autoProvideVariables({
                $: 'jquery',
                jQuery: 'jquery'
            });
            config.autoProvideVariables({
                bar: './bar',
                foo: './foo'
            });
            config.autoProvideVariables({
                foo: './foo2'
            });

            expect(JSON.stringify(config.providedVariables))
                .to.equal(JSON.stringify({
                    $: 'jquery',
                    jQuery: 'jquery',
                    bar: './bar',
                    foo: './foo2',
                }))
            ;
        });

        it('Calling with string throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.autoProvideVariables('jquery');
            }).to.throw('must pass an object');
        });

        it('Calling with an Array throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.autoProvideVariables(['jquery']);
            }).to.throw('must pass an object');
        });
    });

    describe('configureBabel', () => {
        it('Calling method sets it', () => {
            const config = createConfig();
            const testCallback = () => {};
            config.configureBabel(testCallback);
            expect(config.babelConfigurationCallback).to.equal(testCallback);
        });

        it('Calling with non-callback throws an error', () => {
            const config = createConfig();

            expect(() => {
                config.configureBabel('FOO');
            }).to.throw('must be a callback function');
        });

        it('Calling when .babelrc is present throws an exception', () => {
            const config = createConfig();
            config.runtimeConfig.babelRcFileExists = true;

            expect(() => {
                config.configureBabel(() => {});
            }).to.throw('configureBabel() cannot be called because your app has a .babelrc file');
        });
    });

    describe('enableSassLoader', () => {
        it('Call with no config', () => {
            const config = createConfig();
            config.enableSassLoader();

            expect(config.useSassLoader).to.be.true;
        });

        it('Pass valid config', () => {
            const config = createConfig();
            config.enableSassLoader({ resolve_url_loader: false });

            expect(config.useSassLoader).to.be.true;
            expect(config.sassOptions.resolve_url_loader).to.be.false;
        });

        it('Pass invalid config', () => {
            const config = createConfig();

            expect(() => {
                config.enableSassLoader({ fake_option: false });
            }).to.throw('Invalid option "fake_option" passed to enableSassLoader()');
        });
    });

    describe('addLoader', () => {
        it('Adds a new loader with default options', () => {
            const config = createConfig();

            config.addLoader(/\.custom$/, 'custom-loader');

            expect(Array.from(config.loaders)).to.deep.equals([{ 'test': /\.custom$/, 'use': 'custom-loader', 'include': null, 'exclude': null }]);
        });

        it('Adds a custom exclude path', () => {
            const config = createConfig();

            config.addLoader(/\.custom$/, 'custom-loader', { 'exclude': 'node_modules' });

            expect(Array.from(config.loaders)).to.deep.equals([{ 'test': /\.custom$/, 'use': 'custom-loader', 'include': null, 'exclude': 'node_modules' }]);
        });
    });
});

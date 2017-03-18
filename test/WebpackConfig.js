var expect    = require('chai').expect;
var WebpackConfig = require('../lib/WebpackConfig');
var path = require('path');
var fs = require('fs');

describe('WebpackConfig object', () => {

    describe('setOutputPath', () => {
        it('use absolute, existent path', () => {
            var config = new WebpackConfig();
            config.setOutputPath(__dirname);

            expect(config.outputPath).to.equal(__dirname);
        });

        it('relative path, becomes absolute', () => {
            var config = new WebpackConfig();
            config.setOutputPath('assets');

            // the "context" dir is resolved to the directory
            // of this plugin, because it holds a package.json
            expect(config.outputPath).to.equal(
                path.join(__dirname, '../assets')
            );

            // cleanup!
            fs.rmdirSync(path.join(__dirname, '../assets'));
        });

        it('non-existent path creates directory', () => {
            var targetPath = path.join(__dirname, 'new_dir');
            if (fs.existsSync(targetPath)) {
                fs.rmdirSync(targetPath);
            }

            var config = new WebpackConfig();
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

            var config = new WebpackConfig();
            expect(() => {
                config.setOutputPath(targetPath);
            }).to.throw('create this directory');
        });
    });

    describe('setPublicPath', () => {
        it('/foo => /foo/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('/foo');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('/foo/ => /foo/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('/foo/');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('https://example.com => https://example.com/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('https://example.com');

            expect(config.publicPath).to.equal('https://example.com/');
        });

        it('https://example.com/ => https://example.com/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('https://example.com/');

            expect(config.publicPath).to.equal('https://example.com/');
        });

        it('foo => throws an error', () => {
            var config = new WebpackConfig();

            expect(() => {
                config.setPublicPath('foo');
            }).to.throw('must start with "/"');
        });

        it('foo/ => throws an error', () => {
            var config = new WebpackConfig();

            expect(() => {
                config.setPublicPath('foo/');
            }).to.throw('must start with "/"');
        });
    });

    describe('addEntry', () => {
        it('Calling with a duplicate name throws an error', () => {
            var config = new WebpackConfig();
            config.addEntry('entry_foo', './foo.js');

            expect(() => {
                config.addEntry('entry_foo', './bar.js');
            }).to.throw('Duplicate name');
        });

        it('Calling with a duplicate of addStyleEntry', () => {
            var config = new WebpackConfig();
            config.addStyleEntry('main', './main.scss');

            expect(() => {
                config.addEntry('main', './main.js');
            }).to.throw('conflicts with a name passed to addStyleEntry');
        });
    });

    describe('addStyleEntry', () => {
        it('Calling with a duplicate name throws an error', () => {
            var config = new WebpackConfig();
            config.addStyleEntry('entry_foo', './foo.css');

            expect(() => {
                config.addStyleEntry('entry_foo', './bar.css');
            }).to.throw('Duplicate name');
        });

        it('Calling with a duplicate of addEntry', () => {
            var config = new WebpackConfig();
            config.addEntry('main', './main.scss');

            expect(() => {
                config.addStyleEntry('main', './main.js');
            }).to.throw('conflicts with a name passed to addEntry');
        });
    });

    describe('createSharedEntry', () => {
        it('Calling twice throws an error', () => {
            var config = new WebpackConfig();
            config.createSharedEntry('vendor', 'jquery');

            expect(() => {
                config.createSharedEntry('vendor2', './main');
            }).to.throw('cannot be called multiple');
        });
    });

    describe('autoProvideVariables', () => {
        it('Calling multiple times merges', () => {
            var config = new WebpackConfig();
            config.autoProvideVariables({
                $: 'jquery',
                jQuery: 'jquery'
            });
            config.autoProvideVariables({
                foo: './foo'
            });

            expect(JSON.stringify(config.providedVariables))
                .to.equal(JSON.stringify({
                    foo: './foo',
                    $: 'jquery',
                    jQuery: 'jquery',
                }))
            ;
        });

        it('Calling with string throws an error', () => {
            var config = new WebpackConfig();

            console.log('foo' instanceof String);

            expect(() => {
                config.autoProvideVariables('jquery');
            }).to.throw('must pass an object');
        });

        it('Calling with an Array throws an error', () => {
            var config = new WebpackConfig();

            expect(() => {
                config.autoProvideVariables(['jquery']);
            }).to.throw('must pass an object');
        });
    });
});

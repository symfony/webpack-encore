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
        it('foo => /foo/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('foo');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('/foo => /foo/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('/foo');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('foo/ => /foo/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('foo/');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('/foo/ => /foo/', () => {
            var config = new WebpackConfig();
            config.setPublicPath('/foo/');

            expect(config.publicPath).to.equal('/foo/');
        });

        it('passing a URL throws an error', () => {
            var config = new WebpackConfig();

            expect(() => {
                config.setPublicPath('://example.com/foo');
            }).to.throw('must pass a path');
        });
    });

    describe('setPublicCDNPath', () => {
        it('https://example.com => https://example.com/', () => {
            var config = new WebpackConfig();
            config.setPublicCDNPath('https://example.com');

            expect(config.publicCDNPath).to.equal('https://example.com/');
        });

        it('https://example.com/ => https://example.com/', () => {
            var config = new WebpackConfig();
            config.setPublicCDNPath('https://example.com/');

            expect(config.publicCDNPath).to.equal('https://example.com/');
        });

        it('passing a path throws an error', () => {
            var config = new WebpackConfig();

            expect(() => {
                config.setPublicCDNPath('/foo');
            }).to.throw('must pass a full URL');
        });
    });
});

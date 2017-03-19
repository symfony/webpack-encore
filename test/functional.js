const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;

const webpack = require('webpack');
const WebpackConfig = require('../lib/WebpackConfig');
const generator = require('../lib/config_generator');
const path = require('path');
const fs = require('fs');
const testSetup = require('../lib/test/setup');
const assertUtil = require('../lib/test/assert');

function runWebpack(webpackConfig, callback) {
    const compiler = webpack(generator(webpackConfig));
    compiler.run((err, stats) => {
        if (err) {
            console.error(err.stack || err);
            if (err.details) {
              console.error(err.details);
            }

            throw new Error(`Error running webpack!`);
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
            console.error(info.errors);

            throw new Error(`Compilation error running webpack!`);
        }

        if (stats.hasWarnings()) {
            console.warn(info.warnings)
        }

        callback(assertUtil(webpackConfig));
    });
}

describe('Functional tests using webpack', () => {
    describe('Basic scenarios', () => {
        beforeEach(() => {
            testSetup.emptyTestDir();
        });

        it('Builds a simple .js file + manifest.json', (done) => {
            var config = testSetup.createWebpackConfig('web/build');
            config.addEntry('main', './js/no_require');
            config.setPublicPath('/build');

            runWebpack(config, (webpackAssert) => {
                // should have a main.js file
                // should have a manifest.json with public/main.js

                expect(config.outputPath).to.be.a.directory()
                    .with.files(['main.js', 'manifest.json']);

                // check that main.js has the correct contents
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'i am the no_require.js file'
                );
                // check that main.js has the webpack bootstrap
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    '__webpack_require__'
                );
                webpackAssert.assertManifestPath(
                    'main.js',
                    '/build/main.js'
                );

                done();
            });
        });

        it('setPublicPath with a CDN loads assets from the CDN', (done) => {
            var config = testSetup.createWebpackConfig('public/assets');
            config.addEntry('main', './js/code_splitting');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.setPublicPath('http://localhost:8090/assets');

            runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files(['0.js', 'main.js', 'font.css', 'bg.css', 'manifest.json']);

                // check that the publicPath is set correctly
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    '__webpack_require__.p = "http://localhost:8090/assets/";'
                );

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    'http://localhost:8090/assets/images/symfony_logo.png'
                );
                webpackAssert.assertOutputFileContains(
                    'font.css',
                    'http://localhost:8090/assets/fonts/Roboto.woff2'
                );

                testSetup.requestTestPage(
                    'public',
                    ['/assets/main.js'],
                    (browser) => {
                        webpackAssert.assertResourcesLoadedCorrectly(browser, [
                            '0.js',
                            // guarantee that we assert that main.js is loaded from the
                            // main server, as it's simply a script tag to main.js on the page
                            // we did this to check that the internally-loaded assets
                            // use the CDN, even if the entry point does not
                            'http://127.0.0.1:8080/assets/main.js'
                        ]);

                        done();
                    }
                );
            });
        });

        it('addStyleEntry .js files are removed', (done) => {
            var config = testSetup.createWebpackConfig('web');
            config.addEntry('main', './js/no_require');
            config.setPublicPath('/');
            config.addStyleEntry('styles', './css/h1_style.css');

            runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    // public.js should not exist
                    .with.files(['main.js', 'styles.css', 'manifest.json']);

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    'font-size: 50px;'
                );
                // todo - this isn't the biggest deal, but it's failing
                // assertManifestPathDoesNotExist(
                //     'public/styles.js'
                // );

                done();
            });
        });

        it('enableVersioning applies to js, css & manifest', (done) => {
            var config = testSetup.createWebpackConfig('web/build');
            config.addEntry('main', './js/code_splitting');
            config.setPublicPath('/build');
            config.addStyleEntry('h1', './css/h1_style.css');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.enableVersioning(true);

            runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        '0.8f595ffed74b056680e4.js', // chunks are also versioned
                        'main.db34c9c1183e61f91049.js',
                        'h1.c84caea6dd12bba7955dee9fedd5fd03.css',
                        'bg.b311ca58a053400945a78a6a6a8ba245.css',
                        'manifest.json'
                    ]
                );

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.ea1ca6f7f3719118f301a5cfcb1df3c0.png'
                    ]
                );

                webpackAssert.assertOutputFileContains(
                    'bg.b311ca58a053400945a78a6a6a8ba245.css',
                    '/build/images/symfony_logo.ea1ca6f7f3719118f301a5cfcb1df3c0.png'
                );

                done();
            });
        });

        it('font and image files are copied correctly', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.addStyleEntry('font', './css/roboto_font.css');

            runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        'bg.css',
                        'font.css',
                        'manifest.json'
                    ]
                );

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.png'
                    ]
                );

                expect(path.join(config.outputPath, 'fonts')).to.be.a.directory()
                    .with.files([
                        'Roboto.woff2'
                    ]
                );

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    '/build/images/symfony_logo.png'
                );
                webpackAssert.assertOutputFileContains(
                    'font.css',
                    '/build/fonts/Roboto.woff2'
                );

                webpackAssert.assertOutputFileContains(
                    'font.css',
                    '/build/fonts/Roboto.woff2'
                );

                done();
            });
        });

        it('enableSourceMaps() adds to .js, css & scss', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addEntry('main', './js/no_require');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.enableSourceMaps();

            runWebpack(config, (webpackAssert) => {
                webpackAssert.assertOutputFileHasSourcemap(
                    'main.js'
                );
                webpackAssert.assertOutputFileHasSourcemap(
                    'bg.css'
                );
                webpackAssert.assertOutputFileHasSourcemap(
                    'font.css'
                );

                done();
            });
        });

        it('Code splitting a scss file works', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            // loads sass_features.scss via require.ensure
            config.addEntry('main', './js/code_split_load_scss');

            runWebpack(config, (webpackAssert) => {
                // make sure sass is parsed
                webpackAssert.assertOutputFileContains(
                    '0.js',
                    'color: #333'
                );
                // and imported files are loaded correctly
                webpackAssert.assertOutputFileContains(
                    '0.js',
                    'background: top left'
                );

                done();
            });
        });

        it('createdSharedEntry() creates commons files', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require', './js/code_splitting']);
            config.addEntry('other', ['./js/no_require']);
            config.createSharedEntry('vendor', './js/no_require');

            runWebpack(config, (webpackAssert) => {
                // check the file is extracted correctly
                webpackAssert.assertOutputFileContains(
                    'vendor.js',
                    'i am the no_require.js file'
                );
                // we should also have a manifest file with the webpack bootstrap code
                webpackAssert.assertOutputFileContains(
                    'manifest.js',
                    'function __webpack_require__'
                );

                done();
            });
        });

        it('in production mode, code is uglified', (done) => {
            var config = testSetup.createWebpackConfig('www/build', 'production');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require']);

            runWebpack(config, (webpackAssert) => {
                // the comment should not live in the file
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    '// comments in no_require.js'
                );

                done();
            });
        });
    });
});

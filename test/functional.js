/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const path = require('path');
const testSetup = require('./helpers/setup');
const fs = require('fs-extra');
const sharedEntryTmpName = require('../lib/utils/sharedEntryTmpName');

function createWebpackConfig(outputDirName = '', command, argv = {}) {
    const webpackConfig = testSetup.createWebpackConfig(
        testSetup.createTestAppDir(),
        outputDirName,
        command,
        argv
    );

    webpackConfig.enableSingleRuntimeChunk();

    return webpackConfig;
}

function convertToManifestPath(assetSrc, webpackConfig) {
    const manifestData = JSON.parse(
        fs.readFileSync(path.join(webpackConfig.outputPath, 'manifest.json'), 'utf8')
    );

    if (typeof manifestData[assetSrc] === 'undefined') {
        throw new Error(`Path ${assetSrc} not found in manifest!`);
    }

    return manifestData[assetSrc];
}

describe('Functional tests using webpack', function() {
    // being functional tests, these can take quite long
    this.timeout(8000);

    before(() => {
        testSetup.emptyTmpDir();
    });

    describe('Basic scenarios.', () => {

        it('Builds a few simple entries file + manifest.json', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.addEntry('main', './js/no_require');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.addStyleEntry('bg', './css/another_bg_image.css');
            config.setPublicPath('/build');

            testSetup.runWebpack(config, (webpackAssert) => {
                // should have a main.js file
                // should have a manifest.json with public/main.js

                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'runtime.js',
                    'main.js',
                    'font.css',
                    'bg.css',
                    'fonts/Roboto.9896f773.woff2',
                    'images/symfony_logo.ea1ca6f7.png',
                    'manifest.json',
                    'entrypoints.json'
                ]);

                // check that main.js has the correct contents
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'i am the no_require.js file'
                );
                // check that main.js has the webpack bootstrap
                webpackAssert.assertOutputFileContains(
                    'runtime.js',
                    '__webpack_require__'
                );
                webpackAssert.assertManifestPath(
                    'build/main.js',
                    '/build/main.js'
                );
                webpackAssert.assertManifestPath(
                    'build/font.css',
                    '/build/font.css'
                );
                webpackAssert.assertManifestPath(
                    'build/fonts/Roboto.woff2',
                    '/build/fonts/Roboto.9896f773.woff2'
                );
                webpackAssert.assertManifestPath(
                    'build/images/symfony_logo.png',
                    '/build/images/symfony_logo.ea1ca6f7.png'
                );

                webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                    entrypoints: {
                        main: {
                            js: ['build/runtime.js', 'build/main.js']
                        },
                        font: {
                            js: ['build/runtime.js'],
                            css: ['build/font.css']
                        },
                        bg: {
                            js: ['build/runtime.js'],
                            css: ['build/bg.css']
                        }
                    }
                });

                done();
            });
        });

        it('Use "all" splitChunks & look at entrypoints.json', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
            config.addEntry('other', ['./css/roboto_font.css', 'vue']);
            config.setPublicPath('/build');
            config.configureSplitChunks((splitChunks) => {
                splitChunks.chunks = 'all';
                splitChunks.minSize = 0;
            });

            testSetup.runWebpack(config, (webpackAssert) => {
                webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                    entrypoints: {
                        main: {
                            js: ['build/runtime.js', 'build/vendors~main~other.js', 'build/main~other.js', 'build/main.js'],
                            css: ['build/main~other.css']
                        },
                        other: {
                            js: ['build/runtime.js', 'build/vendors~main~other.js', 'build/main~other.js', 'build/other.js'],
                            css: ['build/main~other.css']
                        }
                    }
                });

                done();
            });
        });

        it('Disable the runtime chunk', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.addEntry('main', './js/no_require');
            config.disableSingleRuntimeChunk();
            config.setPublicPath('/build');

            testSetup.runWebpack(config, (webpackAssert) => {
                // no runtime.js
                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'main.js',
                    'manifest.json',
                    'entrypoints.json'
                ]);

                done();
            });
        });

        it('setPublicPath with CDN loads assets from the CDN', (done) => {
            const config = createWebpackConfig('public/assets', 'dev');
            config.addEntry('main', './js/code_splitting');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.setPublicPath('http://localhost:8090/assets');
            config.enableSassLoader();
            config.setManifestKeyPrefix('assets');

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files(['0.css', '0.js', 'main.js', 'runtime.js', 'font.css', 'bg.css', 'manifest.json', 'entrypoints.json']);

                // check that the publicPath is set correctly
                webpackAssert.assertOutputFileContains(
                    'runtime.js',
                    '__webpack_require__.p = "http://localhost:8090/assets/";'
                );

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    'http://localhost:8090/assets/images/symfony_logo.ea1ca6f7.png'
                );
                webpackAssert.assertOutputFileContains(
                    'font.css',
                    'http://localhost:8090/assets/fonts/Roboto.9896f773.woff2'
                );
                // manifest file has CDN in value
                webpackAssert.assertManifestPath(
                    'assets/main.js',
                    'http://localhost:8090/assets/main.js'
                );

                testSetup.requestTestPage(
                    path.join(config.getContext(), 'public'),
                    [
                        // purposely load this NOT from the CDN
                        'assets/runtime.js',
                        'assets/main.js'
                    ],
                    (browser) => {
                        webpackAssert.assertResourcesLoadedCorrectly(browser, [
                            '0.js',
                            // guarantee that we assert that main.js is loaded from the
                            // main server, as it's simply a script tag to main.js on the page
                            // we did this to check that the internally-loaded assets
                            // use the CDN, even if the entry point does not
                            'http://127.0.0.1:8080/assets/runtime.js',
                            'http://127.0.0.1:8080/assets/main.js'
                        ]);

                        done();
                    }
                );
            });
        });

        it('The devServer config loads successfully', (done) => {
            const config = createWebpackConfig('public/assets', 'dev-server', {
                port: '8090'
            });
            config.addEntry('main', './js/code_splitting');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.setPublicPath('/assets');
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that the publicPath is set correctly
                webpackAssert.assertOutputFileContains(
                    'runtime.js',
                    '__webpack_require__.p = "http://localhost:8090/assets/";'
                );

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    'http://localhost:8090/assets/images/symfony_logo.ea1ca6f7.png'
                );
                // manifest file has CDN in value
                webpackAssert.assertManifestPath(
                    'assets/main.js',
                    'http://localhost:8090/assets/main.js'
                );

                testSetup.requestTestPage(
                    path.join(config.getContext(), 'public'),
                    [
                        convertToManifestPath('assets/runtime.js', config),
                        convertToManifestPath('assets/main.js', config)
                    ],
                    (browser) => {
                        webpackAssert.assertResourcesLoadedCorrectly(browser, [
                            'runtime.js',
                            'main.js',
                            '0.js',
                        ]);

                        done();
                    }
                );
            });
        });

        it('Deploying to a subdirectory is no problem', (done) => {
            const config = createWebpackConfig('subdirectory/build', 'dev');
            config.addEntry('main', './js/code_splitting');
            config.setPublicPath('/subdirectory/build');
            config.setManifestKeyPrefix('build');

            testSetup.runWebpack(config, (webpackAssert) => {
                webpackAssert.assertManifestPath(
                    'build/main.js',
                    '/subdirectory/build/main.js'
                );

                testSetup.requestTestPage(
                    // the webroot will not include the /subdirectory/build part
                    path.join(config.getContext(), ''),
                    [
                        convertToManifestPath('build/runtime.js', config),
                        convertToManifestPath('build/main.js', config)
                    ],
                    (browser) => {
                        webpackAssert.assertResourcesLoadedCorrectly(browser, [
                            'http://127.0.0.1:8080/subdirectory/build/0.js',
                            'http://127.0.0.1:8080/subdirectory/build/main.js',
                            'http://127.0.0.1:8080/subdirectory/build/runtime.js',
                        ]);

                        done();
                    }
                );
            });
        });

        it('Empty manifestKeyPrefix is allowed', (done) => {
            const config = createWebpackConfig('build', 'dev');
            config.addEntry('main', './js/code_splitting');
            config.setPublicPath('/build');
            config.setManifestKeyPrefix('');

            testSetup.runWebpack(config, (webpackAssert) => {
                webpackAssert.assertManifestPath(
                    'main.js',
                    '/build/main.js'
                );

                done();
            });
        });

        describe('addStyleEntry .js files are removed', () => {
            it('Without versioning', (done) => {
                const config = createWebpackConfig('web', 'dev');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/');
                config.addStyleEntry('styles', './css/h1_style.css');

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        // public.js should not exist
                        .with.files(['main.js', 'styles.css', 'manifest.json', 'entrypoints.json', 'runtime.js']);

                    webpackAssert.assertOutputFileContains(
                        'styles.css',
                        'font-size: 50px;'
                    );
                    webpackAssert.assertManifestPathDoesNotExist(
                        'styles.js'
                    );
                    webpackAssert.assertManifestPath(
                        'styles.css',
                        '/styles.css'
                    );

                    done();
                });
            });

            it('With default versioning', (done) => {
                const config = createWebpackConfig('web', 'dev');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/');
                config.addStyleEntry('styles', './css/h1_style.css');
                config.enableVersioning(true);

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'main.f1e0a935.js',
                            'styles.8ec31654.css',
                            'manifest.json',
                            'entrypoints.json',
                            'runtime.d41d8cd9.js',
                        ]);

                    webpackAssert.assertOutputFileContains(
                        'styles.8ec31654.css',
                        'font-size: 50px;'
                    );
                    webpackAssert.assertManifestPathDoesNotExist(
                        'styles.js'
                    );
                    webpackAssert.assertManifestPath(
                        'styles.css',
                        '/styles.8ec31654.css'
                    );

                    done();
                });
            });

            it('With query string versioning', (done) => {
                const config = createWebpackConfig('web', 'dev');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/');
                config.addStyleEntry('styles', './css/h1_style.css');
                config.enableVersioning(true);
                config.configureFilenames({
                    js: '[name].js?[chunkhash:16]',
                    css: '[name].css?[contenthash:16]'
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files(['main.js', 'styles.css', 'manifest.json', 'entrypoints.json', 'runtime.js']);

                    webpackAssert.assertOutputFileContains(
                        'styles.css',
                        'font-size: 50px;'
                    );
                    webpackAssert.assertManifestPathDoesNotExist(
                        'styles.js'
                    );
                    webpackAssert.assertManifestPath(
                        'styles.css',
                        '/styles.css?8ec316547cc77b39'
                    );

                    done();
                });
            });

            it('With source maps in production mode', (done) => {
                const config = createWebpackConfig('web', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/');
                config.addStyleEntry('styles', './css/h1_style.css');
                config.enableSourceMaps(true);

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'main.js',
                            'main.js.map',
                            'styles.css',
                            'styles.css.map',
                            'manifest.json',
                            'entrypoints.json',
                            'runtime.js',
                            'runtime.js.map',
                            // no styles.js
                            // no styles.js.map
                        ]);

                    webpackAssert.assertManifestPathDoesNotExist(
                        'styles.js'
                    );

                    webpackAssert.assertManifestPathDoesNotExist(
                        'styles.js.map'
                    );

                    done();
                });
            });
        });

        it('enableVersioning applies to js, css & manifest', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.addEntry('main', './js/code_splitting');
            config.setPublicPath('/build');
            config.addStyleEntry('h1', './css/h1_style.css');
            config.addStyleEntry('bg', './css/another_bg_image.css');
            config.enableSassLoader();
            config.enableVersioning(true);

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        '0.8256b1ad.js', // chunks are also versioned
                        '0.8ec31654.css',
                        'main.ba427376.js',
                        'h1.8ec31654.css',
                        'bg.0ec2735b.css',
                        'manifest.json',
                        'entrypoints.json',
                        'runtime.d41d8cd9.js',
                    ]);

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.ea1ca6f7.png'
                    ]);

                webpackAssert.assertOutputFileContains(
                    'bg.0ec2735b.css',
                    '/build/images/symfony_logo.ea1ca6f7.png'
                );

                done();
            });
        });

        it('font and image files are copied correctly', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        'bg.css',
                        'font.css',
                        'manifest.json',
                        'entrypoints.json',
                        'runtime.js',
                    ]);

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.ea1ca6f7.png'
                    ]);

                expect(path.join(config.outputPath, 'fonts')).to.be.a.directory()
                    .with.files([
                        'Roboto.9896f773.woff2'
                    ]);

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    '/build/images/symfony_logo.ea1ca6f7.png'
                );

                webpackAssert.assertOutputFileContains(
                    'font.css',
                    '/build/fonts/Roboto.9896f773.woff2'
                );

                done();
            });
        });

        it('two fonts or images with the same filename should not output a single file', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addStyleEntry('styles', './css/same_filename.css');
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        'styles.css',
                        'manifest.json',
                        'entrypoints.json',
                        'runtime.js',
                    ]);

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.ea1ca6f7.png',
                        'symfony_logo.f27119c2.png'
                    ]);

                expect(path.join(config.outputPath, 'fonts')).to.be.a.directory()
                    .with.files([
                        'Roboto.9896f773.woff2',
                        'Roboto.3c37aa69.woff2'
                    ]);

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/images/symfony_logo.ea1ca6f7.png'
                );

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/images/symfony_logo.f27119c2.png'
                );

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/fonts/Roboto.9896f773.woff2'
                );

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/fonts/Roboto.3c37aa69.woff2'
                );

                done();
            });
        });

        it('enableSourceMaps() adds to .js, css & scss', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/no_require');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.enableSassLoader();
            config.enableSourceMaps();

            testSetup.runWebpack(config, (webpackAssert) => {
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

        it('Without enableSourceMaps(), there are no sourcemaps', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/no_require');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                    'main.js'
                );
                // TODO - fix this, there IS always a sourcemap in .sass files
                // webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                //     'bg.css'
                // );
                webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                    'font.css'
                );

                done();
            });
        });

        it('Code splitting a scss file works', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            // loads sass_features.scss via require.ensure
            config.addEntry('main', './js/code_split_load_scss');
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                // make sure sass is parsed
                webpackAssert.assertOutputFileContains(
                    '0.css',
                    'color: #333'
                );
                // and imported files are loaded correctly
                webpackAssert.assertOutputFileContains(
                    '0.css',
                    'background: top left'
                );

                done();
            });
        });

        it('createdSharedEntry() creates commons files', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require', './js/code_splitting', './js/arrow_function', './js/print_to_app']);
            config.addEntry('other', ['./js/no_require', './css/h1_style.css']);
            config.createSharedEntry('shared', './js/shared_example');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check the file is extracted correctly
                webpackAssert.assertOutputFileContains(
                    'shared.js',
                    'i am the no_require.js file'
                );
                webpackAssert.assertOutputFileContains(
                    'shared.js',
                    'arrow_function.js is ready for action'
                );
                webpackAssert.assertOutputFileContains(
                    'shared.css',
                    'font-size: 50px;'
                );

                // check that there is NOT duplication
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    'i am the no_require.js file'
                );
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    'arrow_function.js is ready for action'
                );
                // this file has no contents remaining, so should not be output
                webpackAssert.assertOutputFileDoesNotExist('other.css');

                // we should also have a runtime file with the webpack bootstrap code
                webpackAssert.assertOutputFileContains(
                    'runtime.js',
                    'function __webpack_require__'
                );

                // make sure the _tmp_shared entry does not live in the manifest
                webpackAssert.assertManifestPathDoesNotExist(
                    sharedEntryTmpName + '.js'
                );
                webpackAssert.assertOutputFileDoesNotContain('entrypoints.json', sharedEntryTmpName);

                // make sure runtime.js is here
                // but the _tmp_shared entry is NOT here
                webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                    entrypoints: {
                        main: {
                            js: ['build/runtime.js', 'build/shared.js', 'build/main.js'],
                            css: ['build/shared.css']
                        },
                        other: {
                            js: ['build/runtime.js', 'build/shared.js', 'build/other.js'],
                            css: ['build/shared.css']
                        }
                    }
                });

                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/shared.js',
                    ],
                    (browser) => {
                        // assert that the javascript brought into shared is executed
                        browser.assert.text('#app', 'Welcome to Encore!');
                        done();
                    }
                );
            });
        });

        it('createdSharedEntry() with shouldUseSingleRuntimeChunk not set', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            // set back to the "not set" value
            config.shouldUseSingleRuntimeChunk = null;
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require', './js/code_splitting', './js/arrow_function', './js/print_to_app']);
            config.createSharedEntry('shared', './js/shared_example');

            testSetup.runWebpack(config, (webpackAssert) => {
                // should be called manifest.js
                webpackAssert.assertOutputFileContains(
                    'manifest.js',
                    'function __webpack_require__'
                );

                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        'build/manifest.js',
                        'build/shared.js',
                    ],
                    (browser) => {
                        // assert that the javascript brought into shared is executed
                        browser.assert.text('#app', 'Welcome to Encore!');
                        done();
                    }
                );
            });
        });

        it('createdSharedEntry() does not run shared code twice', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require', './js/code_splitting', './js/arrow_function', './js/print_to_app']);
            config.addEntry('other', ['./js/no_require', './css/h1_style.css']);
            // in this situation, we create a shared entry that contains zero shared code
            // in practice (for some reason) this causes SplitChunksPlugin to NOT
            // remove the "shared" entry, which, in theory, our hack would cause
            // the code to be executed twice. However, in practice, thanks to our
            // hack (the addition of the fake entry file), suddenly the shared
            // entry DOES have chunks that should be split, and the "shared" entry
            // is removed, like in all other situations. This test proves that this
            // guarantees the code is not executed twice.
            config.createSharedEntry('shared', './js/append_to_app');

            testSetup.runWebpack(config, (webpackAssert) => {
                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/shared.js',
                    ],
                    (browser) => {
                        // assert JS code is executed, ONLY once
                        browser.assert.text('#app', 'Welcome to Encore!');
                        done();
                    }
                );
            });
        });

        it('createdSharedEntry() works with versioning', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require', './js/code_splitting', './js/arrow_function', './js/print_to_app']);
            config.addEntry('other', ['./js/no_require', './css/h1_style.css']);
            config.createSharedEntry('shared', './js/shared_example');
            config.enableVersioning();

            testSetup.runWebpack(config, (webpackAssert) => {
                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        convertToManifestPath('build/runtime.js', config),
                        convertToManifestPath('build/shared.js', config),
                    ],
                    (browser) => {
                        // assert that the javascript brought into shared is executed
                        browser.assert.text('#app', 'Welcome to Encore!');
                        done();
                    }
                );
            });
        });

        it('createdSharedEntry() works with source maps enabled', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require', './js/code_splitting', './js/arrow_function', './js/print_to_app']);
            config.addEntry('other', ['./js/no_require', './css/h1_style.css']);
            config.createSharedEntry('shared', './js/shared_example');
            config.enableSourceMaps(true);

            testSetup.runWebpack(config, (webpackAssert) => {
                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        convertToManifestPath('build/runtime.js', config),
                        convertToManifestPath('build/shared.js', config),
                    ],
                    (browser) => {
                        // assert that the javascript brought into shared is executed
                        browser.assert.text('#app', 'Welcome to Encore!');
                        done();
                    }
                );
            });
        });

        it('in production mode, code is uglified', (done) => {
            const config = createWebpackConfig('www/build', 'production');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/no_require']);
            config.addEntry('styles', './css/h1_style.css');

            testSetup.runWebpack(config, (webpackAssert) => {
                // the comment should not live in the file
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    '// comments in no_require.js'
                );
                // check for any webpack-added comments
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    '/*!'
                );
                // extra spaces should not live in the CSS file
                webpackAssert.assertOutputFileDoesNotContain(
                    'styles.css',
                    '    font-size: 50px;'
                );

                done();
            });
        });

        it('PostCSS works when enabled', (done) => {
            const appDir = testSetup.createTestAppDir();

            fs.writeFileSync(
                path.join(appDir, 'postcss.config.js'),
                `
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}
                `
            );

            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.setPublicPath('/build');
            // load a file that @import's another file, so that we can
            // test that @import resources are parsed through postcss
            config.addStyleEntry('styles', ['./css/imports_autoprefixer.css']);
            config.enablePostCssLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that the autoprefixer did its work!
                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '-webkit-full-screen'
                );

                done();
            });
        });

        it('less processes when enabled', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addStyleEntry('styles', ['./css/h2_styles.less']);
            config.enableLessLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that less did its work!
                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    // less logic inside will resolve to tis
                    'color: #fe33ac;'
                );

                done();
            });
        });

        it('stylus processes when enabled', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addStyleEntry('styles', ['./css/h2_styles.styl']);
            config.enableStylusLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that stylus did its work!
                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    // stylus logic inside will resolve to tis
                    'color: #9e9399;'
                );

                done();
            });
        });

        it('Babel is executed on .js files', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/arrow_function');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the arrow function
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    '=>'
                );

                done();
            });
        });

        it('Babel can be configured via .babelrc', (done) => {
            // create the .babelrc file first, so we see it
            const appDir = testSetup.createTestAppDir();

            fs.writeFileSync(
                path.join(appDir, '.babelrc'),
                `
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "chrome": 52
      }
    }]
  ]
}
`
            );

            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/class-syntax');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the arrow function
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    // chrome 45 supports class, so it's not transpiled
                    'class A {}'
                );

                done();
            });
        });

        it('Babel can be configured via package.json browserlist', (done) => {
            const cwd = process.cwd();
            after(() => {
                process.chdir(cwd);
            });

            const appDir = testSetup.createTestAppDir();
            /*
             * Most of the time, we don't explicitly use chdir
             * in order to set the cwd() to the test directory.
             * That's because, in theory, you should be able to
             * run Encore from other directories, give you set
             * the context. However, in this case, babel/presest-env
             * uses process.cwd() to find the configPath, instead of the
             * context. So, in this case, we *must* set the cwd()
             * to be the temp test directory.
             */
            process.chdir(appDir);

            // create the package.json file first, so we see it
            fs.writeFileSync(
                path.join(appDir, 'package.json'),
                `
{
  "browserslist": "Chrome 52"
}
`
            );

            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/class-syntax');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the arrow function
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    // chrome 45 supports class, so it's not transpiled
                    'class A {}'
                );

                done();
            });
        });

        it('When enabled, react JSX is transformed!', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/CoolReactComponent.jsx');
            config.enableReactPreset();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the JSX
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'React.createElement'
                );

                done();
            });
        });

        it('When enabled, preact JSX is transformed without preact-compat!', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/CoolReactComponent.jsx');
            config.enablePreactPreset();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the JSX
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'var hiGuys = h('
                );

                done();
            });
        });

        it('When enabled, preact JSX is transformed with preact-compat!', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/CoolReactComponent.jsx');
            config.enablePreactPreset({ preactCompat: true });

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the JSX
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'React.createElement'
                );

                done();
            });
        });

        it('When configured, TypeScript is compiled!', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/index.ts']);
            const testCallback = () => {};
            config.enableTypeScriptLoader(testCallback);

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that ts-loader transformed the ts file
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'document.getElementById(\'app\').innerHTML ='
                );

                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    (browser) => {

                        // assert that the ts module rendered
                        browser.assert.text('#app h1', 'Welcome to Your TypeScript App');
                        done();
                    }
                );
            });
        });

        it('TypeScript is compiled and type checking is done in a separate process!', (done) => {
            this.timeout(8000);
            setTimeout(done, 7000);

            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/render.ts', './js/index.ts']);
            config.enableTypeScriptLoader();
            // test should fail if `config.tsconfig` is not set up properly
            config.enableForkedTypeScriptTypesChecking((config) => {
                config.silent = true; // remove to get output on terminal
            });

            expect(function() {
                testSetup.runWebpack(config, (webpackAssert) => {
                    done();
                });
            }).to.throw('wrong `tsconfig` path in fork plugin configuration (should be a relative or absolute path)');
        });

        it('When configured, Handlebars is compiled', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/handlebars.js']);
            const testCallback = () => {};
            config.enableHandlebarsLoader(testCallback);

            testSetup.runWebpack(config, () => {
                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    (browser) => {
                        browser.assert.text('#app h1', 'Welcome to Your Handlebars App');
                        done();
                    }
                );
            });
        });

        it('The output directory is cleaned between builds', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/no_require');
            config.cleanupOutputBeforeBuild();
            testSetup.touchFileInOutputDir('file.txt', config);
            testSetup.touchFileInOutputDir('deeper/other.txt', config);

            testSetup.runWebpack(config, (webpackAssert) => {
                // make sure the file was cleaned up!
                webpackAssert.assertOutputFileDoesNotExist(
                    'file.txt'
                );
                webpackAssert.assertOutputFileDoesNotExist(
                    'deeper/other.txt'
                );

                done();
            });
        });

        it('Vue.js is compiled correctly', (done) => {
            const appDir = testSetup.createTestAppDir();

            fs.writeFileSync(
                path.join(appDir, 'postcss.config.js'),
                `
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}                            `
            );

            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            config.addEntry('main', './vuejs/main');
            config.enableVueLoader();
            config.enableSassLoader();
            config.enableLessLoader();
            config.configureBabel(function(config) {
                config.presets = [
                    ['@babel/preset-env', {
                        'targets': {
                            'chrome': 52
                        }
                    }]
                ];
            });

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'main.js',
                    'main.css',
                    'images/logo.82b9c7a5.png',
                    'manifest.json',
                    'entrypoints.json',
                    'runtime.js',
                ]);

                // test that our custom babel config is used
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'class TestClassSyntax'
                );

                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    (browser) => {
                        // assert that the vue.js app rendered
                        browser.assert.text('#app h1', 'Welcome to Your Vue.js App');
                        // make sure the styles are not inlined
                        browser.assert.elements('style', 0);

                        done();
                    }
                );
            });
        });

        it('Vue.js error when using non-activated loaders', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './vuejs/main');
            config.enableVueLoader();

            testSetup.runWebpack(config, (webpackAssert, stats, output) => {
                expect(output).to.contain('To load LESS files');
                expect(output).to.contain('To load Sass files');

                done();
            }, true);
        });

        it('configureUrlLoader() allows to use the URL loader for images/fonts', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.setPublicPath('/build');
            config.addStyleEntry('url-loader', './css/url-loader.css');
            config.configureUrlLoader({
                images: { limit: 102400 },
                fonts: { limit: 102400 }
            });

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        'url-loader.css',
                        'manifest.json',
                        'entrypoints.json',
                        'runtime.js'
                    ]);

                webpackAssert.assertOutputFileContains(
                    'url-loader.css',
                    'url(data:font/woff2;base64,'
                );

                webpackAssert.assertOutputFileContains(
                    'url-loader.css',
                    'url(data:image/png;base64,'
                );

                done();
            });
        });

        it('When enabled, eslint checks for linting errors', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/eslint');
            config.enableEslintLoader({
                // Force eslint-loader to output errors instead of sometimes
                // using warnings (see: https://github.com/MoOx/eslint-loader#errors-and-warning)
                emitError: true,
                rules: {
                    // That is not really needed since it'll use the
                    // .eslintrc.js file at the root of the project, but
                    // it'll avoid breaking this test if we change these
                    // rules later on.
                    'indent': ['error', 2],
                    'no-unused-vars': ['error', { 'args': 'all' }]
                }
            });

            testSetup.runWebpack(config, (webpackAssert, stats) => {
                const eslintErrors = stats.toJson().errors[0];

                expect(eslintErrors).to.contain('Expected indentation of 0 spaces but found 2');
                expect(eslintErrors).to.contain('\'a\' is assigned a value but never used');

                done();
            }, true);
        });

        it('Code splitting with dynamic import', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/code_splitting_dynamic_import');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check for the code-split file
                webpackAssert.assertOutputFileContains(
                    '0.js',
                    'document.getElementById(\'app\').innerHTML ='
                );

                testSetup.requestTestPage(
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    (browser) => {

                        // assert the async module was loaded and works
                        browser.assert.text('#app', 'Welcome to Encore!');
                        done();
                    }
                );
            });
        });

        describe('copyFiles() allows to copy files and folders', () => {
            it('Single file copy', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({
                    from: './images',
                    pattern: /symfony_logo\.png/,
                    includeSubdirectories: false
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json',
                            'symfony_logo.png'
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo.png',
                        '/build/symfony_logo.png'
                    );

                    done();
                });
            });

            it('Folder copy without subdirectories', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({
                    from: './images',
                    includeSubdirectories: false
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json',
                            'symfony_logo.png',
                            'symfony_logo_alt.png',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo.png',
                        '/build/symfony_logo.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo_alt.png',
                        '/build/symfony_logo_alt.png'
                    );

                    done();
                });
            });

            it('Multiple copies', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles([{
                    from: './images',
                    to: 'assets/[path][name].[ext]',
                    includeSubdirectories: false
                }, {
                    from: './fonts',
                    to: 'assets/[path][name].[ext]',
                    includeSubdirectories: false
                }]);

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json'
                        ]);

                    expect(path.join(config.outputPath, 'assets')).to.be.a.directory()
                        .with.files([
                            'symfony_logo.png',
                            'symfony_logo_alt.png',
                            'Roboto.woff2',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/assets/symfony_logo.png',
                        '/build/assets/symfony_logo.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/assets/symfony_logo_alt.png',
                        '/build/assets/symfony_logo_alt.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/assets/Roboto.woff2',
                        '/build/assets/Roboto.woff2'
                    );

                    done();
                });
            });

            it('Copy folder and subdirectories with versioning enabled to the specified location', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({
                    from: './images',
                    to: 'images/[path][name].[hash:8].[ext]',
                    includeSubdirectories: true
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json',
                        ]);

                    expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                        .with.files([
                            'symfony_logo.ea1ca6f7.png',
                            'symfony_logo_alt.f27119c2.png',
                        ]);

                    expect(path.join(config.outputPath, 'images', 'same_filename')).to.be.a.directory()
                        .with.files([
                            'symfony_logo.f27119c2.png',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/symfony_logo.png',
                        '/build/images/symfony_logo.ea1ca6f7.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/symfony_logo_alt.png',
                        '/build/images/symfony_logo_alt.f27119c2.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/same_filename/symfony_logo.png',
                        '/build/images/same_filename/symfony_logo.f27119c2.png'
                    );

                    done();
                });
            });

            it('Filter files using the given pattern', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({
                    from: './images',
                    pattern: /_alt/,
                    includeSubdirectories: false
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json',
                            'symfony_logo_alt.png',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo_alt.png',
                        '/build/symfony_logo_alt.png'
                    );

                    webpackAssert.assertManifestPathDoesNotExist(
                        'build/symfony_logo.png'
                    );

                    done();
                });
            });

            it('Copy with versioning enabled', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.enableVersioning(true);
                config.copyFiles([{
                    from: './images',
                    includeSubdirectories: false
                }, {
                    from: './fonts',
                    to: 'assets/[path][name].[ext]',
                    includeSubdirectories: false
                }]);

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.d41d8cd9.js',
                            'main.1172d977.js',
                            'manifest.json',
                            'symfony_logo.ea1ca6f7.png',
                            'symfony_logo_alt.f27119c2.png',
                        ]);

                    expect(path.join(config.outputPath, 'assets')).to.be.a.directory()
                        .with.files([
                            'Roboto.woff2',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.1172d977.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo.png',
                        '/build/symfony_logo.ea1ca6f7.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo_alt.png',
                        '/build/symfony_logo_alt.f27119c2.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/assets/Roboto.woff2',
                        '/build/assets/Roboto.woff2'
                    );

                    done();
                });
            });
        });

        describe('entrypoints.json', () => {
            it('Use "all" splitChunks & look at entrypoints.json', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
                config.addEntry('other', ['./css/roboto_font.css', 'vue']);
                config.setPublicPath('/build');
                // enable versioning to make sure entrypoints.json is not affected
                config.splitEntryChunks();
                config.configureSplitChunks((splitChunks) => {
                    splitChunks.minSize = 0;
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                        entrypoints: {
                            main: {
                                js: ['build/runtime.js', 'build/vendors~main~other.js', 'build/main~other.js', 'build/main.js'],
                                css: ['build/main~other.css']
                            },
                            other: {
                                js: ['build/runtime.js', 'build/vendors~main~other.js', 'build/main~other.js', 'build/other.js'],
                                css: ['build/main~other.css']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('build/vendors~main~other.js');

                    done();
                });
            });

            it('Custom public path does affect entrypoints.json but does not affect manifest.json', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
                config.addEntry('other', ['./css/roboto_font.css', 'vue']);
                config.setPublicPath('http://localhost:8080/build');
                config.setManifestKeyPrefix('custom_prefix');
                config.configureSplitChunks((splitChunks) => {
                    splitChunks.chunks = 'all';
                    splitChunks.minSize = 0;
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                        entrypoints: {
                            main: {
                                js: [
                                    'http://localhost:8080/build/runtime.js',
                                    'http://localhost:8080/build/vendors~main~other.js',
                                    'http://localhost:8080/build/main~other.js',
                                    'http://localhost:8080/build/main.js'
                                ],
                                css: ['http://localhost:8080/build/main~other.css']
                            },
                            other: {
                                js: [
                                    'http://localhost:8080/build/runtime.js',
                                    'http://localhost:8080/build/vendors~main~other.js',
                                    'http://localhost:8080/build/main~other.js',
                                    'http://localhost:8080/build/other.js'
                                ],
                                css: ['http://localhost:8080/build/main~other.css']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('custom_prefix/vendors~main~other.js');

                    done();
                });
            });

            it('Use splitChunks in production mode', (done) => {
                const config = createWebpackConfig('web/build', 'production');
                config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
                config.addEntry('other', ['./css/roboto_font.css', 'vue']);
                config.setPublicPath('/build');
                config.splitEntryChunks();
                config.configureSplitChunks((splitChunks) => {
                    splitChunks.minSize = 0;
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    // in production, we hash the chunk names to avoid exposing any extra details
                    webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                        entrypoints: {
                            main: {
                                js: ['build/runtime.js', 'build/vendors~cc515e6e.js', 'build/default~cc515e6e.js', 'build/main.js'],
                                css: ['build/default~cc515e6e.css']
                            },
                            other: {
                                js: ['build/runtime.js', 'build/vendors~cc515e6e.js', 'build/default~cc515e6e.js', 'build/other.js'],
                                css: ['build/default~cc515e6e.css']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('build/vendors~cc515e6e.js');

                    done();
                });
            });

            it('Use splitEntryChunks() with code splitting', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', ['./js/code_splitting', 'vue']);
                config.addEntry('other', ['./js/no_require', 'vue']);
                config.setPublicPath('/build');
                config.splitEntryChunks();
                config.configureSplitChunks((splitChunks) => {
                    splitChunks.minSize = 0;
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                        entrypoints: {
                            main: {
                                js: ['build/runtime.js', 'build/vendors~main~other.js', 'build/main.js']
                            },
                            other: {
                                // the 0.[hash].js is because the "no_require" module was already split to this
                                // so, it has that filename, instead of following the normal pattern
                                js: ['build/runtime.js', 'build/vendors~main~other.js', 'build/0.js', 'build/other.js']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('build/vendors~main~other.js');
                    webpackAssert.assertManifestKeyExists('build/0.js');

                    done();
                });
            });
        });
    });
});

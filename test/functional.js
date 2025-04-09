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
chai.use(require('chai-subset'));
const expect = chai.expect;
const path = require('path');
const testSetup = require('./helpers/setup');
const fs = require('fs-extra');
const getVueVersion = require('../lib/utils/get-vue-version');
const packageHelper = require('../lib/package-helper');
const semver = require('semver');
const puppeteer = require('puppeteer');

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
    const manifestData = JSON.parse(readOutputFileContents('manifest.json', webpackConfig));

    if (typeof manifestData[assetSrc] === 'undefined') {
        throw new Error(`Path ${assetSrc} not found in manifest!`);
    }

    return manifestData[assetSrc];
}

function readOutputFileContents(filename, config) {
    const fullPath = path.join(config.outputPath, filename);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Output file "${filename}" does not exist.`);
    }

    return fs.readFileSync(fullPath, 'utf8');
}

function getEntrypointData(config, entryName) {
    const entrypointsData = JSON.parse(readOutputFileContents('entrypoints.json', config));

    if (typeof entrypointsData.entrypoints[entryName] === 'undefined') {
        throw new Error(`The entry ${entryName} was not found!`);
    }

    return entrypointsData.entrypoints[entryName];
}

function getIntegrityData(config) {
    const entrypointsData = JSON.parse(readOutputFileContents('entrypoints.json', config));
    if (typeof entrypointsData.integrity === 'undefined') {
        throw new Error('The entrypoints.json file does not contain an integrity object!');
    }

    return entrypointsData.integrity;
}

describe('Functional tests using webpack', function() {
    /** @type {import('puppeteer').Browser} */
    let browser;

    // being functional tests, these can take quite long
    this.timeout(10000);

    before(function(done) {
        this.timeout(15000);
        puppeteer.launch({ headless: 'new', timeout: 14000, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(_browser => {
            browser = _browser;
            done();
        }).catch(err => {
            console.log('Unable to launch Puppeteer');
            console.log(err);
            throw err;
        });
    });

    after(function(done) {
        browser.close().then(done);
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
                    'fonts/Roboto.e1dcc0db.woff2',
                    'images/symfony_logo.91beba37.png',
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
                    '/build/fonts/Roboto.e1dcc0db.woff2'
                );
                webpackAssert.assertManifestPath(
                    'build/images/symfony_logo.png',
                    '/build/images/symfony_logo.91beba37.png'
                );

                webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                    entrypoints: {
                        main: {
                            js: ['/build/runtime.js', '/build/main.js']
                        },
                        font: {
                            js: ['/build/runtime.js'],
                            css: ['/build/font.css']
                        },
                        bg: {
                            js: ['/build/runtime.js'],
                            css: ['/build/bg.css']
                        }
                    }
                });

                done();
            });
        });

        it('Check manifest.json with node_module includes', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.addEntry('main', './js/import_node_modules_image');
            config.setPublicPath('/build');

            testSetup.runWebpack(config, (webpackAssert) => {
                // should have a main.js file
                // should have a manifest.json with public/main.js

                webpackAssert.assertOutputJsonFileMatches('manifest.json', {
                    'build/main.js': '/build/main.js',
                    'build/runtime.js': '/build/runtime.js',
                    'build/images/symfony_logo.png': '/build/images/symfony_logo.91beba37.png',
                    'build/images/logo.png': '/build/images/logo.cb197657.png',
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
                            js: [
                                '/build/runtime.js',
                                '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                '/build/css_roboto_font_css.js',
                                '/build/main.js'
                            ],
                            css: ['/build/css_roboto_font_css.css']
                        },
                        other: {
                            js: [
                                '/build/runtime.js',
                                '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                '/build/css_roboto_font_css.js',
                                '/build/other.js'
                            ],
                            css: ['/build/css_roboto_font_css.css']
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
            config.setPublicPath('http://127.0.0.1:8090/assets');
            config.enableSassLoader();
            config.setManifestKeyPrefix('assets');

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        'js_no_require_js-css_h1_style_css.css',
                        'js_no_require_js-css_h1_style_css.js',
                        'main.js',
                        'runtime.js',
                        'font.css',
                        'bg.css',
                        'manifest.json',
                        'entrypoints.json'
                    ]);

                // check that the publicPath is set correctly
                webpackAssert.assertOutputFileContains(
                    'runtime.js',
                    '__webpack_require__.p = "http://127.0.0.1:8090/assets/";'
                );

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    'http://127.0.0.1:8090/assets/images/symfony_logo.91beba37.png'
                );
                webpackAssert.assertOutputFileContains(
                    'font.css',
                    'http://127.0.0.1:8090/assets/fonts/Roboto.e1dcc0db.woff2'
                );
                // manifest file has CDN in value
                webpackAssert.assertManifestPath(
                    'assets/main.js',
                    'http://127.0.0.1:8090/assets/main.js'
                );

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'public'),
                    [
                        // purposely load this NOT from the CDN
                        'assets/runtime.js',
                        'assets/main.js'
                    ],
                    ({ loadedResources }) => {
                        webpackAssert.assertResourcesLoadedCorrectly(loadedResources, [
                            'js_no_require_js-css_h1_style_css.css',
                            'js_no_require_js-css_h1_style_css.js',
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
                port: '8090',
                host: '127.0.0.1',
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
                    '__webpack_require__.p = "http://127.0.0.1:8090/assets/";'
                );

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    'http://127.0.0.1:8090/assets/images/symfony_logo.91beba37.png'
                );
                // manifest file has CDN in value
                webpackAssert.assertManifestPath(
                    'assets/main.js',
                    'http://127.0.0.1:8090/assets/main.js'
                );

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'public'),
                    [
                        convertToManifestPath('assets/runtime.js', config),
                        convertToManifestPath('assets/main.js', config)
                    ],
                    ({ loadedResources }) => {
                        webpackAssert.assertResourcesLoadedCorrectly(loadedResources, [
                            'runtime.js',
                            'main.js',
                            'js_no_require_js-css_h1_style_css.css',
                            'js_no_require_js-css_h1_style_css.js',
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
                    browser,
                    // the webroot will not include the /subdirectory/build part
                    path.join(config.getContext(), ''),
                    [
                        convertToManifestPath('build/runtime.js', config),
                        convertToManifestPath('build/main.js', config)
                    ],
                    ({ loadedResources }) => {
                        webpackAssert.assertResourcesLoadedCorrectly(loadedResources, [
                            'http://127.0.0.1:8080/subdirectory/build/runtime.js',
                            'http://127.0.0.1:8080/subdirectory/build/main.js',
                            'http://127.0.0.1:8080/subdirectory/build/js_no_require_js-css_h1_style_css.js',
                            'http://127.0.0.1:8080/subdirectory/build/js_no_require_js-css_h1_style_css.css',
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

        it('.mjs files are supported natively', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.addEntry('main', './js/hello_world');
            config.setPublicPath('/build');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that main.js has the correct contents
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'Hello World!'
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
                    webpackAssert.assertDirectoryContents([
                        'main.[hash:8].js',
                        'styles.[hash:8].css',
                        'manifest.json',
                        'entrypoints.json',
                        'runtime.[hash:8].js',
                    ]);

                    webpackAssert.assertOutputFileContains(
                        'styles.[hash:8].css',
                        'font-size: 50px;'
                    );
                    webpackAssert.assertManifestPathDoesNotExist(
                        'styles.js'
                    );
                    webpackAssert.assertManifestPath(
                        'styles.css',
                        '/styles.[hash:8].css'
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
                    js: '[name].js?[contenthash:16]',
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
                        '/styles.css?[hash:16]'
                    );

                    done();
                });
            });

            it('With source maps in production mode', (done) => {
                const config = createWebpackConfig('web', 'production');
                config.addEntry('main', './js/arrow_function');
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
                webpackAssert.assertDirectoryContents([
                    'js_no_require_js-css_h1_style_css.[hash:8].js', // chunks are also versioned
                    'js_no_require_js-css_h1_style_css.[hash:8].css',
                    'main.[hash:8].js',
                    'h1.[hash:8].css',
                    'bg.[hash:8].css',
                    'manifest.json',
                    'entrypoints.json',
                    'runtime.[hash:8].js',
                ]);

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.91beba37.png'
                    ]);

                webpackAssert.assertOutputFileContains(
                    'bg.[hash:8].css',
                    '/build/images/symfony_logo.91beba37.png'
                );

                done();
            });
        });

        it('font and image files are copied correctly', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.enableSassLoader(options => {
                // Use sass-loader instead of node-sass
                options.implementation = require('sass');
            });

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
                        'symfony_logo.91beba37.png'
                    ]);

                expect(path.join(config.outputPath, 'fonts')).to.be.a.directory()
                    .with.files([
                        'Roboto.e1dcc0db.woff2'
                    ]);

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    '/build/images/symfony_logo.91beba37.png'
                );

                webpackAssert.assertOutputFileContains(
                    'font.css',
                    '/build/fonts/Roboto.e1dcc0db.woff2'
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
                        'symfony_logo.91beba37.png',
                        'symfony_logo.f880ba14.png'
                    ]);

                expect(path.join(config.outputPath, 'fonts')).to.be.a.directory()
                    .with.files([
                        'Roboto.e1dcc0db.woff2',
                        'Roboto.2779fd7b.woff2'
                    ]);

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/images/symfony_logo.91beba37.png'
                );

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/images/symfony_logo.f880ba14.png'
                );

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/fonts/Roboto.e1dcc0db.woff2'
                );

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '/build/fonts/Roboto.2779fd7b.woff2'
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
                webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                    'bg.css'
                );
                webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                    'font.css'
                );

                done();
            });
        });

        it('Without enableSourceMaps(), there are no sourcemaps in production', (done) => {
            const config = createWebpackConfig('www/build', 'production');
            config.setPublicPath('/build');
            config.addEntry('main', './js/no_require');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                    'main.js'
                );
                webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                    'font.css'
                );
                webpackAssert.assertOutputFileDoesNotHaveSourcemap(
                    'bg.css'
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
                    'css_sass_features_scss.css',
                    'color: #333'
                );
                // and imported files are loaded correctly
                webpackAssert.assertOutputFileContains(
                    'css_sass_features_scss.css',
                    'background: top left'
                );

                done();
            });
        });

        describe('addCacheGroup()', () => {
            it('addCacheGroup() to extract a vendor into its own chunk', (done) => {
                const config = createWebpackConfig('www/build', 'dev');
                config.setPublicPath('/build');
                config.enableVueLoader();
                config.enablePreactPreset();
                config.enableSassLoader();
                config.enableLessLoader();
                config.addEntry('page1', `./vuejs/main_v${getVueVersion(config)}`);
                config.addEntry('page2', './preact/main');

                // Move Vue.js code into its own chunk
                config.addCacheGroup('vuejs', {
                    test: /[\\/]node_modules[\\/]@vue[\\/]/
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    // Vue.js code should be present in common.js but not in page1.js/page2.js
                    webpackAssert.assertOutputFileContains(
                        'vuejs.js',
                        '/***/ "../../node_modules/@vue/'
                    );

                    webpackAssert.assertOutputFileDoesNotContain(
                        'page1.js',
                        '/***/ "../../node_modules/@vue/'
                    );

                    webpackAssert.assertOutputFileDoesNotContain(
                        'page2.js',
                        '/***/ "../../node_modules/@vue/'
                    );

                    // Preact code should be present in page2.js only
                    webpackAssert.assertOutputFileDoesNotContain(
                        'vuejs.js',
                        '/***/ "../../node_modules/preact/'
                    );

                    webpackAssert.assertOutputFileDoesNotContain(
                        'page1.js',
                        '/***/ "../../node_modules/preact/'
                    );

                    webpackAssert.assertOutputFileContains(
                        'page2.js',
                        '/***/ "../../node_modules/preact/'
                    );

                    // Check if each entrypoint is associated to the right chunks
                    webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                        entrypoints: {
                            page1: {
                                js: ['/build/runtime.js', '/build/vuejs.js', '/build/page1.js'],
                                css: ['/build/page1.css']
                            },
                            page2: {
                                js: ['/build/runtime.js', '/build/page2.js']
                            }
                        }
                    });

                    // Check if Vue.js code is still executed properly
                    testSetup.requestTestPage(
                        browser,
                        path.join(config.getContext(), 'www'),
                        [
                            'build/runtime.js',
                            'build/page1.js',
                            'build/vuejs.js',
                        ],
                        async({ page }) => {
                            const bodyText = await page.evaluate(() => document.querySelector('#app').textContent);
                            expect(bodyText).to.contains('Welcome to Your Vue.js App');

                            done();
                        }
                    );
                });
            });

            it('addCacheGroup() with node_modules', (done) => {
                const config = createWebpackConfig('www/build', 'dev');
                config.setPublicPath('/build');
                config.enableVueLoader();
                config.enablePreactPreset();
                config.enableSassLoader();
                config.enableLessLoader();
                config.addEntry('page1', `./vuejs/main_v${getVueVersion(config)}`);
                config.addEntry('page2', './preact/main');

                // Move both vue.js and preact code into their own chunk
                config.addCacheGroup('common', {
                    node_modules: [
                        '@vue',
                        'preact'
                    ]
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    // Vue.js code should be present in common.js but not in page1.js/page2.js
                    webpackAssert.assertOutputFileContains(
                        'common.js',
                        '/***/ "../../node_modules/@vue/'
                    );

                    webpackAssert.assertOutputFileDoesNotContain(
                        'page1.js',
                        '/***/ "../../node_modules/@vue/'
                    );

                    webpackAssert.assertOutputFileDoesNotContain(
                        'page2.js',
                        '/***/ "../../node_modules/@vue/'
                    );

                    // Preact code should be present in common.js but not in page1.js/page2.js
                    webpackAssert.assertOutputFileContains(
                        'common.js',
                        '/***/ "../../node_modules/preact/'
                    );

                    webpackAssert.assertOutputFileDoesNotContain(
                        'page1.js',
                        '/***/ "../../node_modules/preact/'
                    );

                    webpackAssert.assertOutputFileDoesNotContain(
                        'page2.js',
                        '/***/ "../../node_modules/preact/'
                    );

                    // Check if each entrypoint is associated to the right chunks
                    webpackAssert.assertOutputJsonFileMatches('entrypoints.json', {
                        entrypoints: {
                            page1: {
                                js: ['/build/runtime.js', '/build/common.js', '/build/page1.js'],
                                css: ['/build/page1.css']
                            },
                            page2: {
                                js: ['/build/runtime.js', '/build/common.js', '/build/page2.js']
                            }
                        }
                    });

                    // Check if Preact code is still executed properly
                    testSetup.requestTestPage(
                        browser,
                        path.join(config.getContext(), 'www'),
                        [
                            'build/runtime.js',
                            'build/page2.js',
                            'build/common.js',
                        ],
                        async({ page }) => {
                            expect(await page.evaluate(() => document.querySelector('#app').textContent)).to.contains('This is a React component!');
                            done();
                        }
                    );
                });
            });

            it('addCacheGroup() with versioning enabled', (done) => {
                const config = createWebpackConfig('www/build', 'dev');
                config.setPublicPath('/build');
                config.enableVersioning();
                config.enableVueLoader();
                config.enablePreactPreset();
                config.enableSassLoader();
                config.enableLessLoader();
                config.addEntry('page1', `./vuejs/main_v${getVueVersion(config)}`);
                config.addEntry('page2', './preact/main');

                // Move Vue.js code into its own chunk
                config.addCacheGroup('vuejs', {
                    test: getVueVersion(config) === 2 ?
                        /[\\/]node_modules[\\/]vue[\\/]/ :
                        /[\\/]node_modules[\\/]@vue[\\/]/
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    // Check if Vue.js code is still executed properly
                    testSetup.requestTestPage(
                        browser,
                        path.join(config.getContext(), 'www'),
                        [
                            convertToManifestPath('build/runtime.js', config),
                            convertToManifestPath('build/page1.js', config),
                            convertToManifestPath('build/vuejs.js', config),
                        ],
                        async({ page }) => {
                            const bodyText = await page.evaluate(() => document.querySelector('#app').textContent);
                            expect(bodyText).to.contains('Welcome to Your Vue.js App');

                            done();
                        }
                    );
                });
            });

            it('addCacheGroup() with source maps enabled', (done) => {
                const config = createWebpackConfig('www/build', 'dev');
                config.setPublicPath('/build');
                config.enableSourceMaps();
                config.enableVueLoader();
                config.enablePreactPreset();
                config.enableSassLoader();
                config.enableLessLoader();
                config.addEntry('page1', `./vuejs/main_v${getVueVersion(config)}`);
                config.addEntry('page2', './preact/main');

                // Move Vue.js code into its own chunk
                config.addCacheGroup('vuejs', {
                    test: getVueVersion(config) === 2 ?
                        /[\\/]node_modules[\\/]vue[\\/]/ :
                        /[\\/]node_modules[\\/]@vue[\\/]/
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    // Check if Vue.js code is still executed properly
                    testSetup.requestTestPage(
                        browser,
                        path.join(config.getContext(), 'www'),
                        [
                            'build/runtime.js',
                            'build/page1.js',
                            'build/vuejs.js',
                        ],
                        async({ page }) => {
                            const bodyText = await page.evaluate(() => document.querySelector('#app').textContent);
                            expect(bodyText).to.contains('Welcome to Your Vue.js App');

                            done();
                        }
                    );
                });
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
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            // load a file that @import's another file, so that we can
            // test that @import resources are parsed through postcss
            config.addStyleEntry('styles', ['./css/imports_autoprefixer.css']);
            config.addStyleEntry('postcss', './css/postcss_extension.postcss');
            config.enablePostCssLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that the autoprefixer did its work!
                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    '-webkit-backdrop-filter'
                );

                // check that the .postcss file was also processed
                // correctly (it also @import the autoprefixer_test.css
                // file)
                webpackAssert.assertOutputFileContains(
                    'postcss.css',
                    '-webkit-backdrop-filter'
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
            config.addEntry('main', './js/class-syntax');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the class
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    'class A {}'
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
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            config.addEntry('main', './js/class-syntax');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed classes
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
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            config.addEntry('main', './js/class-syntax');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel did not transform classes
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    // chrome 45 supports class, so it's not transpiled
                    'class A {}'
                );

                done();
            });
        });

        it('Babel adds polyfills correctly', (done) => {
            const cwd = process.cwd();
            after(() => {
                process.chdir(cwd);
            });

            const appDir = testSetup.createTestAppDir();
            process.chdir(appDir);

            fs.writeFileSync(
                path.join(appDir, 'package.json'),

                // The test case uses Array.flat which
                // isn't supported by IE11
                '{"browserslist": "IE 11"}'
            );

            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('commonjs', './js/import_polyfills_commonjs.js');
            config.addEntry('ecmascript', './js/import_polyfills_ecmascript.js');
            config.configureBabel(null, {
                useBuiltIns: 'usage',
                corejs: 3,
            });

            testSetup.runWebpack(config, async(webpackAssert) => {
                for (const scriptName of ['commonjs.js', 'ecmascript.js']) {
                    // Check that the polyfills are included correctly
                    // in both files.
                    webpackAssert.assertOutputFileContains(
                        scriptName,
                        'Array.prototype.flat'
                    );

                    // Test that the generated scripts work fine
                    await testSetup.requestTestPage(
                        browser,
                        path.join(config.getContext(), 'www'),
                        [
                            'build/runtime.js',
                            `build/${scriptName}`,
                        ],
                        async({ page }) => {
                            expect(await page.evaluate(() => document.body.textContent)).to.contains('[1,2,3,4]');
                        }
                    );
                }

                done();
            });
        });

        it('Babel does not force transforms if they are not needed', (done) => {
            const cwd = process.cwd();
            after(() => {
                process.chdir(cwd);
            });

            const appDir = testSetup.createTestAppDir();
            process.chdir(appDir);

            fs.writeFileSync(
                path.join(appDir, 'package.json'),

                // Chrome 55 supports async and arrow functions
                '{"browserslist": "Chrome 55"}'
            );

            const config = createWebpackConfig('www/build', 'prod');
            config.setPublicPath('/build');
            config.addEntry('async', './js/async_function.js');
            config.configureBabel(null, {
                useBuiltIns: 'usage',
                corejs: 3,
            });

            testSetup.runWebpack(config, async(webpackAssert) => {
                webpackAssert.assertOutputFileContains(
                    'async.js',
                    'async function(){console.log("foo")}().then((()=>{console.log("bar")}))'
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

        it('When enabled, svelte is transformed', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/hello_world.svelte');
            config.enableSvelte();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel transformed the svelte files
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'SvelteComponent'
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
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        // assert that the ts module rendered
                        const h1Text = await page.evaluate(() => document.querySelector('#app h1').textContent);
                        expect(h1Text).to.contains('Welcome to Your TypeScript App');

                        done();
                    }
                );
            });
        });

        it('TypeScript is compiled and type checking is done in a separate process!', (done) => {
            this.timeout(10000);
            setTimeout(done, 9000);

            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/render.ts', './js/index.ts']);
            config.enableTypeScriptLoader();
            // test should fail if `config.typescript.configFile` is not set up properly
            config.enableForkedTypeScriptTypesChecking((config) => {

            });

            expect(function() {
                testSetup.runWebpack(config, (webpackAssert) => {
                    done();
                });
                // Cannot find the "/path/to/tsconfig.json" file
            }).to.throw('Cannot find the');
        });

        it('TypeScript can be compiled by Babel', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/render.ts', './js/index.ts']);
            config.enableBabelTypeScriptPreset();

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that babel-loader transformed the ts file
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'document.getElementById(\'app\').innerHTML =',
                );

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js',
                    ],
                    async({ page }) => {
                        // assert that the ts module rendered
                        const h1Text = await page.evaluate(() => document.querySelector('#app h1').textContent);
                        expect(h1Text).to.contains('Welcome to Your TypeScript App');

                        done();
                    },
                );
            });
        });

        it('When configured, Handlebars is compiled', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', ['./js/handlebars.js']);
            const testCallback = () => {};
            config.enableHandlebarsLoader(testCallback);

            testSetup.runWebpack(config, () => {
                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        const h1Text = await page.evaluate(() => document.querySelector('#app h1').textContent);
                        expect(h1Text).to.contains('Welcome to Your Handlebars App');

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
            config.addEntry('main', `./vuejs/main_v${getVueVersion(config)}`);
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
                    'images/logo.26bd867d.png',
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
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        // assert that the vue.js app rendered
                        const h1Text = await page.evaluate(() => document.querySelector('#app h1').textContent);
                        expect(h1Text).to.contains('Welcome to Your Vue.js App');

                        // make sure the styles are not inlined
                        const styleElementsCount = await page.evaluate(() => document.querySelectorAll('style').length);
                        expect(styleElementsCount).to.equal(0);

                        done();
                    }
                );
            });
        });

        it('Vue.js is compiled correctly using TypeScript', (done) => {
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
            config.addEntry('main', `./vuejs${getVueVersion(config)}-typescript/main`);
            config.enableVueLoader();
            config.enableSassLoader();
            config.enableLessLoader();
            config.enableTypeScriptLoader();
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
                    'images/logo.26bd867d.png',
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
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        // assert that the vue.js app rendered
                        const h1Text = await page.evaluate(() => document.querySelector('#app h1').textContent);
                        expect(h1Text).to.contains('Welcome to Your Vue.js App');

                        // make sure the styles are not inlined
                        const styleElementsCount = await page.evaluate(() => document.querySelectorAll('style').length);
                        expect(styleElementsCount).to.equal(0);

                        done();
                    }
                );
            });
        });

        it('Vue.js supports CSS/Sass/Less/Stylus/PostCSS modules', (done) => {
            const appDir = testSetup.createTestAppDir();
            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            config.addEntry('main', `./vuejs-css-modules/main_v${getVueVersion(config)}`);
            config.enableVueLoader();
            config.enableSassLoader();
            config.enableLessLoader();
            config.enableStylusLoader();
            config.configureCssLoader(options => {
                // Until https://github.com/vuejs/vue-loader/pull/1909 is merged,
                // Vue users should configure the css-loader modules
                // to keep the previous default behavior from css-loader v6
                if (options.modules) {
                    options.modules.namedExport = false;
                    options.modules.exportLocalsConvention = 'as-is';
                }

                // Remove hashes from local ident names
                // since they are not always the same.
                if (options.modules) {
                    options.modules.localIdentName = '[local]_foo';
                }
            });

            // Enable the PostCSS loader so we can use `lang="postcss"`
            config.enablePostCssLoader();
            fs.writeFileSync(
                path.join(appDir, 'postcss.config.js'),
                `
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}                            `
            );

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'main.js',
                    'main.css',
                    'manifest.json',
                    'entrypoints.json',
                    'runtime.js',
                ]);

                const expectClassDeclaration = (className) => {
                    webpackAssert.assertOutputFileContains(
                        'main.css',
                        `.${className} {`
                    );
                };

                expectClassDeclaration('red'); // Standard CSS
                expectClassDeclaration('large'); // Standard SCSS
                expectClassDeclaration('justified'); // Standard Less
                expectClassDeclaration('lowercase'); // Standard Stylus
                expectClassDeclaration('block'); // Standard PostCSS

                expectClassDeclaration('italic_foo'); // CSS Module
                expectClassDeclaration('bold_foo'); // SCSS Module
                expectClassDeclaration('underline_foo'); // Less Module
                expectClassDeclaration('rtl_foo'); // Stylus Module
                expectClassDeclaration('hidden_foo'); // PostCSS Module

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        const divClassArray = await page.evaluate(() => Array.from(document.body.querySelector('#app > div').classList.values()));

                        expect(divClassArray.includes('red')).to.be.true; // Standard CSS
                        expect(divClassArray.includes('large')).to.be.true; // Standard SCSS
                        expect(divClassArray.includes('justified')).to.be.true; // Standard Less
                        expect(divClassArray.includes('lowercase')).to.be.true; // Standard Stylus
                        expect(divClassArray.includes('block')).to.be.true; // Standard PostCSS

                        expect(divClassArray.includes('italic_foo')).to.be.true; // CSS module
                        expect(divClassArray.includes('bold_foo')).to.be.true; // SCSS module
                        expect(divClassArray.includes('underline_foo')).to.be.true; // Less module
                        expect(divClassArray.includes('rtl_foo')).to.be.true; // Stylus module
                        expect(divClassArray.includes('hidden_foo')).to.be.true; // PostCSS module

                        done();
                    }
                );
            });
        });

        it('React supports CSS/Sass/Less/Stylus modules', (done) => {
            const appDir = testSetup.createTestAppDir();
            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            config.addEntry('main', './react-css-modules/main.js');
            config.enableReactPreset();
            config.enableSassLoader();
            config.enableLessLoader();
            config.enableStylusLoader();
            config.configureCssLoader(options => {
                // Remove hashes from local ident names
                // since they are not always the same.
                if (options.modules) {
                    options.modules.localIdentName = '[local]_foo';
                }
            });

            // Enable the PostCSS loader so we can use `lang="postcss"`
            config.enablePostCssLoader();
            fs.writeFileSync(
                path.join(appDir, 'postcss.config.js'),
                `
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}                            `
            );

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'main.js',
                    'main.css',
                    'manifest.json',
                    'entrypoints.json',
                    'runtime.js',
                ]);

                const expectClassDeclaration = (className) => {
                    webpackAssert.assertOutputFileContains(
                        'main.css',
                        `.${className} {`
                    );
                };

                expectClassDeclaration('red'); // Standard CSS
                expectClassDeclaration('large'); // Standard SCSS
                expectClassDeclaration('justified'); // Standard Less
                expectClassDeclaration('lowercase'); // Standard Stylus

                expectClassDeclaration('italic_foo'); // CSS Module
                expectClassDeclaration('bold_foo'); // SCSS Module
                expectClassDeclaration('underline_foo'); // Less Module
                expectClassDeclaration('rtl_foo'); // Stylus Module

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        const divClassArray = await page.evaluate(() => Array.from(document.body.querySelector('#app > div').classList.values()));

                        expect(divClassArray.includes('red')).to.be.true; // Standard CSS
                        expect(divClassArray.includes('large')).to.be.true; // Standard SCSS
                        expect(divClassArray.includes('justified')).to.be.true; // Standard Less
                        expect(divClassArray.includes('lowercase')).to.be.true; // Standard Stylus

                        expect(divClassArray.includes('italic_foo')).to.be.true; // CSS module
                        expect(divClassArray.includes('bold_foo')).to.be.true; // SCSS module
                        expect(divClassArray.includes('underline_foo')).to.be.true; // Less module
                        expect(divClassArray.includes('rtl_foo')).to.be.true; // Stylus module

                        done();
                    }
                );
            });
        });

        it('Preact supports CSS/Sass/Less/Stylus modules', (done) => {
            const appDir = testSetup.createTestAppDir();
            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            config.addEntry('main', './preact-css-modules/main.js');
            config.enablePreactPreset();
            config.enableSassLoader();
            config.enableLessLoader();
            config.enableStylusLoader();
            config.configureCssLoader(options => {
                // Remove hashes from local ident names
                // since they are not always the same.
                if (options.modules) {
                    options.modules.localIdentName = '[local]_foo';
                }
            });

            // Enable the PostCSS loader so we can use `lang="postcss"`
            config.enablePostCssLoader();
            fs.writeFileSync(
                path.join(appDir, 'postcss.config.js'),
                `
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}                            `
            );

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'main.js',
                    'main.css',
                    'manifest.json',
                    'entrypoints.json',
                    'runtime.js',
                ]);

                const expectClassDeclaration = (className) => {
                    webpackAssert.assertOutputFileContains(
                        'main.css',
                        `.${className} {`
                    );
                };

                expectClassDeclaration('red'); // Standard CSS
                expectClassDeclaration('large'); // Standard SCSS
                expectClassDeclaration('justified'); // Standard Less
                expectClassDeclaration('lowercase'); // Standard Stylus

                expectClassDeclaration('italic_foo'); // CSS Module
                expectClassDeclaration('bold_foo'); // SCSS Module
                expectClassDeclaration('underline_foo'); // Less Module
                expectClassDeclaration('rtl_foo'); // Stylus Module

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        const divClassArray = await page.evaluate(() => Array.from(document.body.querySelector('#app > div').classList.values()));

                        expect(divClassArray.includes('red')).to.be.true; // Standard CSS
                        expect(divClassArray.includes('large')).to.be.true; // Standard SCSS
                        expect(divClassArray.includes('justified')).to.be.true; // Standard Less
                        expect(divClassArray.includes('lowercase')).to.be.true; // Standard Stylus

                        expect(divClassArray.includes('italic_foo')).to.be.true; // CSS module
                        expect(divClassArray.includes('bold_foo')).to.be.true; // SCSS module
                        expect(divClassArray.includes('underline_foo')).to.be.true; // Less module
                        expect(divClassArray.includes('rtl_foo')).to.be.true; // Stylus module

                        done();
                    }
                );
            });
        });

        it('Vue.js error when using non-activated loaders', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', `./vuejs/main_v${getVueVersion(config)}`);
            config.enableVueLoader();

            testSetup.runWebpack(config, (webpackAssert, stats, output) => {
                expect(output).to.contain('To load LESS files');
                expect(output).to.contain('To load Sass files');

                done();
            }, true);
        });

        it('Vue.js is compiled correctly with JSX support', function(done) {
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
            config.addEntry('main', `./vuejs-jsx/main_v${getVueVersion(config)}`);
            config.enableVueLoader(() => {}, {
                useJsx: true,
                version: getVueVersion(config),
            });
            config.enableSassLoader();
            config.enableLessLoader();
            config.configureBabel(function(config) {
                // throw new Error(JSON.stringify(config));
                expect(config.presets[0][0]).to.equal(require.resolve('@babel/preset-env'));
                config.presets[0][1].targets = {
                    chrome: 109
                };
            });

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'main.js',
                    'main.css',
                    'images/logo.26bd867d.png',
                    'manifest.json',
                    'entrypoints.json',
                    'runtime.js',
                ]);

                // test that our custom babel config is used
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    'class TestClassSyntax'
                );

                // test that global styles are working correctly
                webpackAssert.assertOutputFileContains(
                    'main.css',
                    '#app {'
                );

                // test that CSS Modules (for scoped styles) is used
                webpackAssert.assertOutputFileContains(
                    'main.css',
                    '.h1_' // `.h1` is transformed to `.h1_[a-zA-Z0-9]`
                );

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        // assert that the vue.js app rendered
                        const h1Text = await page.evaluate(() => document.querySelector('#app h1').textContent);
                        expect(h1Text).to.contains('Welcome to Your Vue.js App');

                        // make sure the styles are not inlined
                        const styleElementsCount = await page.evaluate(() => document.querySelectorAll('style').length);
                        expect(styleElementsCount).to.equal(0);

                        done();
                    }
                );
            });
        });

        it('configureImageRule() allows configuring maxSize for inlining', (done) => {
            const config = createWebpackConfig('web/build', 'dev');
            config.setPublicPath('/build');
            config.addStyleEntry('url-loader', './css/url-loader.css');
            // set a size so that they do NOT inline
            config.configureImageRule({ type: 'asset', maxSize: 102400 });
            config.configureFontRule({ type: 'asset', maxSize: 102400 });

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

        it('Code splitting with dynamic import', (done) => {
            const config = createWebpackConfig('www/build', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/code_splitting_dynamic_import');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check for the code-split file
                webpackAssert.assertOutputFileContains(
                    'js_print_to_app_export_js.js',
                    'document.getElementById(\'app\').innerHTML ='
                );

                testSetup.requestTestPage(
                    browser,
                    path.join(config.getContext(), 'www'),
                    [
                        'build/runtime.js',
                        'build/main.js'
                    ],
                    async({ page }) => {
                        // assert the async module was loaded and works
                        expect(await page.evaluate(() => document.querySelector('#app').textContent)).to.contains('Welcome to Encore!');

                        done();
                    }
                );
            });
        });

        it('Symfony - Stimulus standard app is built correctly', function(done) {
            const appDir = testSetup.createTestAppDir();

            const version = packageHelper.getPackageVersion('@symfony/stimulus-bridge');
            if (!semver.satisfies(version, '^3.0.0')) {
                // we support the old version, but it's not tested
                this.skip();

                return;
            }

            const config = testSetup.createWebpackConfig(appDir, 'www/build', 'dev');
            config.enableSingleRuntimeChunk();
            config.setPublicPath('/build');
            config.addEntry('main', './stimulus/assets/app.js');
            config.enableStimulusBridge(__dirname + '/../fixtures/stimulus/assets/controllers.json');

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory().with.deep.files([
                    'main.js',
                    'main.css',
                    'manifest.json',
                    'node_modules_symfony_mock-module_dist_controller_js.js',
                    'entrypoints.json',
                    'runtime.js',
                ]);

                // test controllers and style are shipped
                webpackAssert.assertOutputFileContains('main.js', 'app-controller');
                webpackAssert.assertOutputFileContains('node_modules_symfony_mock-module_dist_controller_js.js', 'mock-module-controller');
                webpackAssert.assertOutputFileContains('main.css', 'body {}');

                done();
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
                            'symfony_logo.91beba37.png',
                            'symfony_logo_alt.f880ba14.png',
                        ]);

                    expect(path.join(config.outputPath, 'images', 'same_filename')).to.be.a.directory()
                        .with.files([
                            'symfony_logo.f880ba14.png',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/symfony_logo.png',
                        '/build/images/symfony_logo.91beba37.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/symfony_logo_alt.png',
                        '/build/images/symfony_logo_alt.f880ba14.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/same_filename/symfony_logo.png',
                        '/build/images/same_filename/symfony_logo.f880ba14.png'
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
                    webpackAssert.assertDirectoryContents([
                        'entrypoints.json',
                        'runtime.[hash:8].js',
                        'main.[hash:8].js',
                        'manifest.json',
                        'symfony_logo.[hash:8].png',
                        'symfony_logo_alt.[hash:8].png',
                    ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.[hash:8].js'
                    );

                    expect(path.join(config.outputPath, 'assets')).to.be.a.directory()
                        .with.files([
                            'Roboto.woff2',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo.png',
                        '/build/symfony_logo.91beba37.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo_alt.png',
                        '/build/symfony_logo_alt.f880ba14.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/assets/Roboto.woff2',
                        '/build/assets/Roboto.woff2'
                    );

                    done();
                });
            });

            it('Do not try to copy files from an invalid path', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles([{
                    from: './images',
                    to: 'assets/[path][name].[ext]',
                    includeSubdirectories: false
                }, {
                    from: './foo',
                    to: 'assets/[path][name].[ext]',
                    includeSubdirectories: false
                }, {
                    from: './fonts',
                    to: 'assets/[path][name].[ext]',
                    includeSubdirectories: false
                }, {
                    from: './images/symfony_logo.png',
                    includeSubdirectories: true
                }]);

                testSetup.runWebpack(config, (webpackAssert, stats, stdout) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json'
                        ]);

                    expect(stdout).to.contain('should be set to an existing directory but "./foo" does not seem to exist');
                    expect(stdout).to.contain('should be set to an existing directory but "./images/symfony_logo.png" seems to be a file');

                    done();
                });
            });

            it('Copy with a custom context', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({
                    from: './images',
                    to: '[path][name].[hash:8].[ext]',
                    includeSubdirectories: true,
                    context: './',
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
                            'symfony_logo.91beba37.png',
                            'symfony_logo_alt.f880ba14.png',
                        ]);

                    expect(path.join(config.outputPath, 'images', 'same_filename')).to.be.a.directory()
                        .with.files([
                            'symfony_logo.f880ba14.png',
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/symfony_logo.png',
                        '/build/images/symfony_logo.91beba37.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/symfony_logo_alt.png',
                        '/build/images/symfony_logo_alt.f880ba14.png'
                    );

                    webpackAssert.assertManifestPath(
                        'build/images/same_filename/symfony_logo.png',
                        '/build/images/same_filename/symfony_logo.f880ba14.png'
                    );

                    done();
                });
            });

            it('Copy files without processing them', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({ from: './copy' });

                // By default the css-minimizer-webpack-plugin will
                // run on ALL emitted CSS files, which includes the ones
                // handled by `Encore.copyFiles()`.
                // We disable it for this test since our CSS file will
                // not be valid and can't be handled by this plugin.
                config.configureCssMinimizerPlugin(options => {
                    options.include = /^$/;
                });

                // By default the terser-webpack-plugin will run on
                // ALL emitted JS files, which includes the ones
                // handled by `Encore.copyFiles()`.
                // We disable it for this test since our JS file will
                // not be valid and can't be handled by this plugin.
                config.configureTerserPlugin(options => {
                    options.include = /^$/;
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json',
                            'foo.css',
                            'foo.js',
                            'foo.json',
                            'foo.png',
                        ]);

                    for (const file of ['foo.css', 'foo.js', 'foo.json', 'foo.png']) {
                        webpackAssert.assertOutputFileContains(
                            file,
                            'This is an invalid content to check that the file is still copied'
                        );
                    }

                    done();
                });
            });

            it('Do not copy files excluded by a RegExp', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');

                // foo.css and foo.js should match this rule
                // and be versioned
                config.copyFiles({
                    from: './copy',
                    to: './[path][name]-[hash:8].[ext]',
                    pattern: /\.(css|js)$/,
                });

                // foo.css and foo.js should *not* match this rule
                config.copyFiles({
                    from: './copy',
                    to: './[path][name].[ext]',
                    pattern: /\.(?!(css|js)$)([^.]+$)/
                });

                // By default the css-minimizer-webpack-plugin will
                // run on ALL emitted CSS files, which includes the ones
                // handled by `Encore.copyFiles()`.
                // We disable it for this test since our CSS file will
                // not be valid and can't be handled by this plugin.
                config.configureCssMinimizerPlugin(options => {
                    options.include = /^$/;
                });

                // By default the terser-webpack-plugin will run on
                // ALL emitted JS files, which includes the ones
                // handled by `Encore.copyFiles()`.
                // We disable it for this test since our JS file will
                // not be valid and can't be handled by this plugin.
                config.configureTerserPlugin(options => {
                    options.include = /^$/;
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    webpackAssert.assertDirectoryContents([
                        'entrypoints.json',
                        'runtime.js',
                        'main.js',
                        'manifest.json',

                        // 1st rule
                        'foo-[hash:8].css',
                        'foo-[hash:8].js',

                        // 2nd rule
                        'foo.json',
                        'foo.png',
                    ]);

                    done();
                });
            });

            it('Can use the "[N]" placeholder', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({
                    from: './images',
                    pattern: /(symfony)_(logo)\.png/,
                    to: '[path][2]_[1].[ext]',
                    includeSubdirectories: false
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'entrypoints.json',
                            'runtime.js',
                            'main.js',
                            'manifest.json',
                            'logo_symfony.png'
                        ]);

                    webpackAssert.assertManifestPath(
                        'build/main.js',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo.png',
                        '/build/logo_symfony.png'
                    );

                    done();
                });
            });

            it('Does not prevent from setting the map option of the manifest plugin', (done) => {
                const config = createWebpackConfig('www/build', 'production');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.copyFiles({
                    from: './images',
                    pattern: /symfony_logo\.png/,
                    includeSubdirectories: false
                });

                config.configureManifestPlugin(options => {
                    options.map = (file) => {
                        return Object.assign({}, file, {
                            name: `${file.name}.test`,
                        });
                    };
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
                        'build/main.js.test',
                        '/build/main.js'
                    );

                    webpackAssert.assertManifestPath(
                        'build/symfony_logo.png.test',
                        '/build/symfony_logo.png'
                    );

                    done();
                });
            });
        });

        describe('entrypoints.json & splitChunks()', () => {
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
                                js: [
                                    '/build/runtime.js',
                                    '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                    '/build/css_roboto_font_css.js',
                                    '/build/main.js'
                                ],
                                css: ['/build/css_roboto_font_css.css']
                            },
                            other: {
                                js: [
                                    '/build/runtime.js',
                                    '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                    '/build/css_roboto_font_css.js',
                                    '/build/other.js'
                                ],
                                css: ['/build/css_roboto_font_css.css']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js');

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
                                    'http://localhost:8080/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                    'http://localhost:8080/build/css_roboto_font_css.js',
                                    'http://localhost:8080/build/main.js'
                                ],
                                css: ['http://localhost:8080/build/css_roboto_font_css.css']
                            },
                            other: {
                                js: [
                                    'http://localhost:8080/build/runtime.js',
                                    'http://localhost:8080/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                    'http://localhost:8080/build/css_roboto_font_css.js',
                                    'http://localhost:8080/build/other.js'
                                ],
                                css: ['http://localhost:8080/build/css_roboto_font_css.css']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('custom_prefix/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js');

                    done();
                });
            });

            it('Subdirectory public path affects entrypoints.json but does not affect manifest.json', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
                config.addEntry('other', ['./css/roboto_font.css', 'vue']);
                config.setPublicPath('/subdirectory/build');
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
                                    '/subdirectory/build/runtime.js',
                                    '/subdirectory/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                    '/subdirectory/build/css_roboto_font_css.js',
                                    '/subdirectory/build/main.js'
                                ],
                                css: ['/subdirectory/build/css_roboto_font_css.css']
                            },
                            other: {
                                js: [
                                    '/subdirectory/build/runtime.js',
                                    '/subdirectory/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                                    '/subdirectory/build/css_roboto_font_css.js',
                                    '/subdirectory/build/other.js'
                                ],
                                css: ['/subdirectory/build/css_roboto_font_css.css']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('custom_prefix/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js');

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

                testSetup.runWebpack(config, () => {
                    // in production, we hash the chunk names to avoid exposing any extra details
                    const entrypointsData = JSON.parse(readOutputFileContents('entrypoints.json', config));
                    const mainJsFiles = entrypointsData.entrypoints.main.js;
                    expect(mainJsFiles).to.have.length(4);
                    expect(mainJsFiles[0]).equals('/build/runtime.js');
                    // keys 1 and 2 are "split files" with an integer name that sometimes changes
                    expect(mainJsFiles[3]).equals('/build/main.js');

                    expect(entrypointsData.entrypoints.main.css[0]).matches(/\/build\/(\d)+\.css/);

                    // make split chunks are correct in manifest
                    const manifestData = JSON.parse(readOutputFileContents('manifest.json', config));
                    mainJsFiles.forEach((file) => {
                        // file.substring(1) => /build/main.js -> build/main.js
                        expect(Object.keys(manifestData)).includes(file.substring(1));
                    });

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
                                js: ['/build/runtime.js', '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js', '/build/main.js']
                            },
                            other: {
                                js: ['/build/runtime.js', '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js', '/build/js_no_require_js.js', '/build/other.js']
                            }
                        }
                    });

                    // make split chunks are correct in manifest
                    webpackAssert.assertManifestKeyExists('build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js');
                    webpackAssert.assertManifestKeyExists('build/js_no_require_js.js');

                    done();
                });
            });

            it('Make sure chunkIds do not change between builds', (done) => {
                // https://github.com/symfony/webpack-encore/issues/461
                const createSimilarConfig = function(includeExtraEntry) {
                    const config = createWebpackConfig('web/build', 'production');
                    config.addEntry('main1', './js/code_splitting');
                    if (includeExtraEntry) {
                        config.addEntry('main2', './js/eslint');
                    }
                    config.addEntry('main3', './js/no_require');
                    config.setPublicPath('/build');

                    return config;
                };

                const configA = createSimilarConfig(false);
                const configB = createSimilarConfig(true);

                testSetup.runWebpack(configA, () => {
                    testSetup.runWebpack(configB, () => {
                        const main3Contents = readOutputFileContents('main3.js', configA);
                        const finalMain3Contents = readOutputFileContents('main3.js', configB);

                        if (finalMain3Contents !== main3Contents) {
                            throw new Error(`Contents after first compile do not match after second compile: \n\n ${main3Contents} \n\n versus \n\n ${finalMain3Contents} \n`);
                        }

                        done();
                    });
                });
            });

            it('Do not change contents or filenames when more modules require the same split contents', (done) => {
                const createSimilarConfig = function(includeExtraEntry) {
                    const config = createWebpackConfig('web/build', 'production');
                    config.addEntry('main1', ['./js/code_splitting', 'preact']);
                    config.addEntry('main3', ['./js/no_require', 'preact']);
                    if (includeExtraEntry) {
                        config.addEntry('main4', ['./js/eslint', 'preact']);
                    }
                    config.setPublicPath('/build');
                    config.splitEntryChunks();
                    config.configureSplitChunks((splitChunks) => {
                        // will include preact, but prevent any other splitting
                        splitChunks.minSize = 10000;
                    });

                    return config;
                };

                const getSplitVendorJsPath = function(config) {
                    const entrypointData = getEntrypointData(config, 'main3');

                    const splitFiles = entrypointData.js.filter(filename => {
                        return filename !== '/build/runtime.js' && filename !== '/build/main3.js';
                    });

                    // sanity check
                    if (splitFiles.length !== 1) {
                        throw new Error(`Unexpected number (${splitFiles.length}) of split files for main3 entry`);
                    }

                    return splitFiles[0];
                };

                const configA = createSimilarConfig(false);
                const configB = createSimilarConfig(true);

                testSetup.runWebpack(configA, () => {
                    testSetup.runWebpack(configB, () => {
                        const vendorPath = getSplitVendorJsPath(configA);
                        const finalVendorPath = getSplitVendorJsPath(configB);

                        // make sure that the filename of the split vendor file didn't change,
                        // even though an additional entry is now sharing its contents
                        if (finalVendorPath !== vendorPath) {
                            throw new Error(`Vendor filename changed! Before ${vendorPath} and after ${finalVendorPath}.`);
                        }

                        // make sure that, internally, the split chunk name did not change,
                        // which would cause the contents of main3 to suddenly change
                        const main3Contents = readOutputFileContents('main3.js', configA);
                        const finalMain3Contents = readOutputFileContents('main3.js', configB);

                        if (finalMain3Contents !== main3Contents) {
                            throw new Error(`Contents after first compile do not match after second compile: \n\n ${main3Contents} \n\n versus \n\n ${finalMain3Contents} \n`);
                        }

                        done();
                    });
                });
            });
        });

        describe('Package entrypoint imports', () => {
            it('Import via "sass" package property', (done) => {
                const config = createWebpackConfig('web/build', 'dev');

                config.setPublicPath('/build');
                config.addAliases({
                    lib: path.resolve('./lib')
                });
                config.enableSassLoader();
                config.addStyleEntry('sass', './css/sass_package_import.scss');

                testSetup.runWebpack(config, () => {
                    // A successful compile is all that is needed to pass this test.
                    // If this test fails then the import in the above sass file
                    // is not loading the package's sass file.
                    done();
                });
            });

            it('Import via "style" package property', (done) => {
                const config = createWebpackConfig('web/build', 'dev');

                config.setPublicPath('/build');
                config.addAliases({
                    lib: path.resolve('./lib')
                });
                config.addStyleEntry('style', './css/style_package_import.css');

                testSetup.runWebpack(config, () => {
                    // A successful compile is all that is needed to pass this test.
                    // If this test fails then the import in the above css file
                    // is not loading the package's style file.
                    done();
                });
            });
        });

        describe('CSS extraction', () => {
            it('With CSS extraction enabled', (done) => {
                const config = createWebpackConfig('build', 'dev');
                config.setPublicPath('/build');
                config.disableSingleRuntimeChunk();
                config.addEntry('main', './js/css_import');

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'manifest.json',
                            'entrypoints.json',
                            'main.js',
                            'main.css',
                        ]);

                    webpackAssert.assertOutputFileContains(
                        'main.css',
                        'font-size: 50px;'
                    );

                    done();
                });
            });

            it('With CSS extraction disabled', (done) => {
                const config = createWebpackConfig('build', 'dev');
                config.setPublicPath('/build');
                config.disableSingleRuntimeChunk();
                config.addEntry('main', './js/css_import');
                config.disableCssExtraction();

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'manifest.json',
                            'entrypoints.json',
                            'main.js'
                        ]);

                    webpackAssert.assertOutputFileContains(
                        'main.js',
                        'font-size: 50px;'
                    );

                    done();
                });
            });

            it('With CSS extraction disabled and with options callback of the StyleLoader', (done) => {
                const config = createWebpackConfig('build', 'dev');
                config.setPublicPath('/build');
                config.disableSingleRuntimeChunk();
                config.addEntry('main', './js/css_import');
                config.disableCssExtraction();
                config.configureStyleLoader((options) => {
                    options.attributes = { id: 'TESTING_ATTRIBUTES' };
                });

                testSetup.runWebpack(config, (webpackAssert) => {
                    expect(config.outputPath).to.be.a.directory()
                        .with.files([
                            'manifest.json',
                            'entrypoints.json',
                            'main.js'
                        ]);

                    webpackAssert.assertOutputFileContains(
                        'main.js',
                        'TESTING_ATTRIBUTES'
                    );

                    done();
                });
            });
        });

        describe('enableIntegrityHashes() adds hashes to the entrypoints.json file', () => {
            it('Using default algorithm', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
                config.addEntry('other', ['./css/roboto_font.css', 'vue']);
                config.setPublicPath('/build');
                config.configureSplitChunks((splitChunks) => {
                    splitChunks.chunks = 'all';
                    splitChunks.minSize = 0;
                });
                config.enableIntegrityHashes();

                testSetup.runWebpack(config, () => {
                    const integrityData = getIntegrityData(config);
                    const expectedFilesWithHashes = [
                        '/build/runtime.js',
                        '/build/main.js',
                        '/build/css_roboto_font_css.js',
                        '/build/css_roboto_font_css.css',
                        '/build/other.js',
                        '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                    ];

                    expectedFilesWithHashes.forEach((file) => {
                        expect(integrityData[file]).to.contain('sha384-');
                        expect(integrityData[file]).to.have.length(71);
                    });

                    done();
                });
            });

            it('Using another algorithm and a different public path', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
                config.addEntry('other', ['./css/roboto_font.css', 'vue']);
                config.setPublicPath('http://localhost:8090/assets');
                config.setManifestKeyPrefix('assets');
                config.configureSplitChunks((splitChunks) => {
                    splitChunks.chunks = 'all';
                    splitChunks.minSize = 0;
                });
                config.enableIntegrityHashes(true, 'sha256');

                testSetup.runWebpack(config, () => {
                    const integrityData = getIntegrityData(config);
                    const expectedFilesWithHashes = [
                        'http://localhost:8090/assets/runtime.js',
                        'http://localhost:8090/assets/main.js',
                        'http://localhost:8090/assets/css_roboto_font_css.js',
                        'http://localhost:8090/assets/css_roboto_font_css.css',
                        'http://localhost:8090/assets/other.js',
                    ];

                    expectedFilesWithHashes.forEach((file) => {
                        expect(integrityData[file]).to.contain('sha256-');
                        expect(integrityData[file]).to.have.length(51);
                    });

                    done();
                });
            });

            it('Using multiple algorithms', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', ['./css/roboto_font.css', './js/no_require', 'vue']);
                config.addEntry('other', ['./css/roboto_font.css', 'vue']);
                config.setPublicPath('/build');
                config.configureSplitChunks((splitChunks) => {
                    splitChunks.chunks = 'all';
                    splitChunks.minSize = 0;
                });
                config.enableIntegrityHashes(true, ['sha256', 'sha512']);

                testSetup.runWebpack(config, () => {
                    const integrityData = getIntegrityData(config);
                    const expectedFilesWithHashes = [
                        '/build/runtime.js',
                        '/build/main.js',
                        '/build/css_roboto_font_css.js',
                        '/build/css_roboto_font_css.css',
                        '/build/other.js',
                        '/build/vendors-node_modules_vue_dist_vue_runtime_esm-bundler_js.js',
                    ];

                    expectedFilesWithHashes.forEach((file) => {
                        expect(integrityData[file]).to.contain('sha256-');
                        expect(integrityData[file]).to.contain('sha512-');
                        expect(integrityData[file]).to.have.length(147);
                    });

                    done();
                });
            });

            it('With query string versioning', (done) => {
                const config = createWebpackConfig('web/build', 'dev');
                config.addEntry('main', './js/no_require');
                config.setPublicPath('/build');
                config.addStyleEntry('styles', './css/h1_style.css');
                config.enableVersioning(true);
                config.configureFilenames({
                    js: '[name].js?v=[contenthash:16]',
                    css: '[name].css?v=[contenthash:16]'
                });
                config.enableIntegrityHashes();

                testSetup.runWebpack(config, (webpackAssert) => {
                    const integrityData = getIntegrityData(config);
                    const expectedFilesWithHashes = Object.keys(integrityData).filter(file => {
                        if (!/\?v=[a-z0-9]{16}$/.test(file)) {
                            return false;
                        }
                        return file.startsWith('/build/runtime.js?v=')
                            || file.startsWith('/build/main.js?v=')
                            || file.startsWith('/build/styles.css?v=');
                    });

                    expectedFilesWithHashes.forEach((file) => {
                        expect(integrityData[file]).to.contain('sha384-');
                        expect(integrityData[file]).to.have.length(71);
                    });

                    done();
                });
            });
        });
    });
});

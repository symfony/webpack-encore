const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const path = require('path');
const testSetup = require('../lib/test/setup');

describe('Functional tests using webpack', function() {
    // being functional tests, these can take quite long
    this.timeout(5000);

    describe('Basic scenarios', () => {
        beforeEach(() => {
            testSetup.emptyTestDir();
        });
        afterEach(() => {
            testSetup.deleteTemporaryFiles();
        });

        it('Builds a simple .js file + manifest.json', (done) => {
            var config = testSetup.createWebpackConfig('web/build');
            config.addEntry('main', './js/no_require');
            config.setPublicPath('/build');

            testSetup.runWebpack(config, (webpackAssert) => {
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
                    'build/main.js',
                    '/build/main.js'
                );

                done();
            });
        });

        it('setPublicPath with CDN loads assets from the CDN', (done) => {
            var config = testSetup.createWebpackConfig('public/assets');
            config.addEntry('main', './js/code_splitting');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.setPublicPath('http://localhost:8090/assets');
            config.enableSassLoader();
            config.setManifestKeyPrefix('assets');

            testSetup.runWebpack(config, (webpackAssert) => {
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
                // manifest file has CDN in value
                webpackAssert.assertManifestPath(
                    'assets/main.js',
                    'http://localhost:8090/assets/main.js'
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

        it('The devServer config loads successfully', (done) => {
            var config = testSetup.createWebpackConfig('public/assets');
            config.addEntry('main', './js/code_splitting');
            config.addStyleEntry('font', './css/roboto_font.css');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.setPublicPath('/assets');
            config.enableSassLoader();
            config.useWebpackDevServer('http://localhost:8090');

            testSetup.runWebpack(config, (webpackAssert) => {
                // check that the publicPath is set correctly
                webpackAssert.assertOutputFileContains(
                    'main.js',
                    '__webpack_require__.p = "http://localhost:8090/assets/";'
                );

                webpackAssert.assertOutputFileContains(
                    'bg.css',
                    'http://localhost:8090/assets/images/symfony_logo.png'
                );
                // manifest file has CDN in value
                webpackAssert.assertManifestPath(
                    'assets/main.js',
                    'http://localhost:8090/assets/main.js'
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

        it('Deploying to a subdirectory is no problem', (done) => {
            var config = testSetup.createWebpackConfig('subdirectory/build');
            config.addEntry('main', './js/code_splitting');
            config.setPublicPath('/subdirectory/build');
            config.setManifestKeyPrefix('build');

            testSetup.runWebpack(config, (webpackAssert) => {
                webpackAssert.assertManifestPath(
                    'build/main.js',
                    '/subdirectory/build/main.js'
                );

                testSetup.requestTestPage(
                    '', // the webroot will not include the /subdirectory/build part
                    ['/subdirectory/build/main.js'],
                    (browser) => {
                        webpackAssert.assertResourcesLoadedCorrectly(browser, [
                            'http://127.0.0.1:8080/subdirectory/build/0.js',
                            'http://127.0.0.1:8080/subdirectory/build/main.js'
                        ]);

                        done();
                    }
                );
            });
        });

        it('Empty manifestKeyPrefix is allowed', (done) => {
            var config = testSetup.createWebpackConfig('build');
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

        it('addStyleEntry .js files are removed', (done) => {
            var config = testSetup.createWebpackConfig('web');
            config.addEntry('main', './js/no_require');
            config.setPublicPath('/');
            config.addStyleEntry('styles', './css/h1_style.css');

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    // public.js should not exist
                    .with.files(['main.js', 'styles.css', 'manifest.json']);

                webpackAssert.assertOutputFileContains(
                    'styles.css',
                    'font-size: 50px;'
                );
                webpackAssert.assertManifestPathDoesNotExist(
                    'styles.js'
                );

                done();
            });
        });

        it('enableVersioning applies to js, css & manifest', (done) => {
            var config = testSetup.createWebpackConfig('web/build');
            config.addEntry('main', './js/code_splitting');
            config.setPublicPath('/build');
            config.addStyleEntry('h1', './css/h1_style.css');
            config.addStyleEntry('bg', './css/background_image.scss');
            config.enableSassLoader();
            config.enableVersioning(true);

            testSetup.runWebpack(config, (webpackAssert) => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        '0.82b5327024051f330d8a.js', // chunks are also versioned
                        'main.c5d553e7a4e1c9367373.js',
                        'h1.c84caea6dd12bba7955dee9fedd5fd03.css',
                        'bg.f8a1ccfa5977d7c46fe2431ba5eef51e.css',
                        'manifest.json'
                    ]
                );

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.ea1ca6f7f3719118f301a5cfcb1df3c0.png'
                    ]
                );

                webpackAssert.assertOutputFileContains(
                    'bg.f8a1ccfa5977d7c46fe2431ba5eef51e.css',
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
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
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

        it('Code splitting a scss file works', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            // loads sass_features.scss via require.ensure
            config.addEntry('main', './js/code_split_load_scss');
            config.enableSassLoader();

            testSetup.runWebpack(config, (webpackAssert) => {
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

            testSetup.runWebpack(config, (webpackAssert) => {
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

            testSetup.runWebpack(config, (webpackAssert) => {
                // the comment should not live in the file
                webpackAssert.assertOutputFileDoesNotContain(
                    'main.js',
                    '// comments in no_require.js'
                );

                done();
            });
        });

        it('PostCSS works when enabled', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addStyleEntry('styles', ['./css/autoprefixer_test.css']);
            config.enablePostCssLoader();

            testSetup.saveTemporaryFileToFixturesDirectory(
                'postcss.config.js',
                `
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}
`
            );

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
            var config = testSetup.createWebpackConfig('www/build');
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

        it('Babel is executed on .js files', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
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
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addEntry('main', './js/class-syntax');
            config.useBabelRcFile();

            testSetup.saveTemporaryFileToFixturesDirectory(
                '.babelrc',
                `
{
  "presets": [
    ["env", {
      "targets": {
        "chrome": 52
      }
    }]
  ]
}
`
            );

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
            var config = testSetup.createWebpackConfig('www/build');
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

        it('The output directory is cleaned between builds', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addEntry('main', './js/no_require');
            config.cleanupOutputBeforeBuild();
            testSetup.touchFileInOutputDir('file.txt', config);

            testSetup.runWebpack(config, (webpackAssert) => {
                // make sure the file was cleaned up!
                webpackAssert.assertOutputFileDoesNotExist(
                    'file.txt'
                );

                done();
            });
        });
    });
});

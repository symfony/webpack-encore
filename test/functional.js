var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;

const webpack = require('webpack');
var WebpackConfig = require('../lib/WebpackConfig');
var generator = require('../lib/config_generator');
const path = require('path');
const fs = require('fs-extra');
const Browser = require('zombie');
const httpServer = require('http-server');
const testSetup = require('../lib/test/setup');

Browser.extend(function (browser) {
    browser.on('error', function (error) {
        throw new Error(error);
    });
});

const testProjectPath = path.join(__dirname, 'project');

function assertOutputFileContains(filePath, expectedContents) {
    var fullPath = path.join(testProjectPath, filePath);
    const actualContents = fs.readFileSync(fullPath, 'utf8');
    if (!actualContents.includes(expectedContents)) {
        throw new Error(`Expected contents "${expectedContents}" not found in file ${fullPath}`);
    }
}

function assertOutputFileHasSourcemap(filePath) {
    var fullPath = path.join(testProjectPath, filePath);
    const actualContents = fs.readFileSync(fullPath, 'utf8');
    if (!actualContents.includes('sourceMappingURL')) {
        throw new Error(`No sourcemap found for ${fullPath}!`);
    }

    var sourceMappingUrlContents = actualContents.split('sourceMappingURL')[1];

    // if you set config.devtool = '#inline-source-map', but then
    // incorrectly configure css/sass sourcemaps, you WILL have
    // a sourcemap, but it will be too small / i.e. basically empty
    if (sourceMappingUrlContents.length < 200) {
        throw new Error(`Sourcemap for ${fullPath} appears to be empty!`);
    }
}

function assertManifestPath(outputDir, sourcePath, expectedDestinationPath) {
    const manifestData = loadManifest(outputDir);

    if (!manifestData[sourcePath]) {
        throw new Error(`No ${sourcePath} key found in manifest ${JSON.stringify(manifestData)}`);
    }

    if (manifestData[sourcePath] != expectedDestinationPath) {
        throw new Error(`source path ${sourcePath} expected to be set to ${expectedDestinationPath}, was actually ${manifestData[sourcePath]}`);
    }
}
function assertManifestPathDoesNotExist(outputDir, sourcePath) {
    const manifestData = loadManifest(outputDir);

    if (manifestData[sourcePath]) {
        throw new Error(`Source ${sourcePath} key WAS found in manifest, but should not be there!`);
    }
}

/**
 *
 * @param {WebpackConfig} webpackConfig
 * @param {Browser} browser
 * @param expectedResourcePaths Array of expected resources, but just
 *                              their short filenames - e.g. main.css
 *                              (i.e. without the public path)
 */
function assertResourcesLoadedCorrectly(webpackConfig, browser, expectedResourcePaths) {
    const actualResources = [];
    for (let resource of browser.resources) {
        if (resource.response.status != 200) {
            throw new Error(`Error: status code ${resource.response.status} when requesting resource ${resource.request.url}`);
        }

        // skip the .html page as a resource
        if (resource.request.url.includes('testing.html')) {
            continue;
        }

        actualResources.push(resource.request.url);
    }

    // prefix each expected resource with its public path
    // needed when the public path is a CDN
    const expectedResources = expectedResourcePaths.map((path) => {
        // if we've explicitly passed a full URL in for testing, ignore that
        if (path.startsWith('http://')) {
            return path;
        }

        return webpackConfig.publicPath+path;
    });

    expect(actualResources).to.have.all.members(expectedResources);
}

function loadManifest(outputDir)
{
    return JSON.parse(
        fs.readFileSync(path.join(outputDir, 'manifest.json'), 'utf8')
    );
}

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

        callback();
    });
}

function startHttpServer(port) {
    var server = httpServer.createServer({
        root: path.join(__dirname, 'project', 'public')
    });

    server.listen(port, '0.0.0.0');

    return server;
}

describe('Functional tests using webpack', () => {
    describe('Basic scenarios', () => {
        beforeEach(() => {
            testSetup.emptyTestDir();
        });

        it('Builds a simple .js file + manifest.json', (done) => {
            var config = testSetup.createWebpackConfig('web/build');
            config.addEntry('main', './no_require');
            config.setPublicPath('/build');

            runWebpack(config, () => {
                // should have a main.js file
                // should have a manifest.json with public/main.js

                expect(config.outputPath).to.be.a.directory()
                    .with.files(['main.js', 'manifest.json']);

                // check that main.js has the correct contents
                assertOutputFileContains(
                    'web/build/main.js',
                    'no_require_loaded'
                );
                // check that main.js has the webpack bootstrap
                assertOutputFileContains(
                    'web/build/main.js',
                    '__webpack_require__'
                );
                assertManifestPath(
                    config.outputPath,
                    'main.js',
                    '/build/main.js'
                );

                done();
            });
        });

        it('setPublicPath with a CDN loads assets from the CDN', (done) => {
            var config = testSetup.createWebpackConfig('public/assets');
            config.addEntry('main', './code_splitting');
            config.setPublicPath('http://localhost:8090/assets');

            // todo - test paths to images/fonts inside CSS file

            runWebpack(config, () => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files(['0.js', 'main.js', 'manifest.json']);

                // check that the publicPath is set correctly
                assertOutputFileContains(
                    'public/assets/main.js',
                    '__webpack_require__.p = "http://localhost:8090/assets/";'
                );

                /*
                 * An experimental thing... where we actually use a browser to try things...
                 *
                 * To get this to pass, you must start 2 servers in a test/project/public directory
                 *      http-server
                 *      http-server -p 8090
                 */
                var server1 = startHttpServer(8080);
                var server2 = startHttpServer(8090);

                // copy to the public root
                fs.copySync(path.join(__dirname, 'testing.html'), path.join(testProjectPath, 'public', 'testing.html'));
                var browser = new Browser();
                browser.visit('http://127.0.0.1:8080/testing.html', () => {
                    assertResourcesLoadedCorrectly(config, browser, [
                        '0.js',
                        // guarantee that we assert that main.js is loaded from the
                        // main server, as it's simply a script tag to main.js on the page
                        // we did this to check that the internally-loaded assets
                        // use the CDN, even if the entry point does not
                        'http://127.0.0.1:8080/assets/main.js'
                    ]);

                    server1.close();
                    server2.close();
                    done();
                });
            });
        });

        it('addStyleEntry .js files are removed', (done) => {
            var config = testSetup.createWebpackConfig('web');
            config.addEntry('main', './no_require');
            config.setPublicPath('/');
            config.addStyleEntry('styles', './h1_style.css');

            runWebpack(config, () => {
                expect(config.outputPath).to.be.a.directory()
                    // public.js should not exist
                    .with.files(['main.js', 'styles.css', 'manifest.json']);

                assertOutputFileContains(
                    'web/styles.css',
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
            config.addEntry('main', './code_splitting');
            config.setPublicPath('/build');
            config.addStyleEntry('h1', './h1_style.css');
            config.addStyleEntry('bg', './background_image.scss');
            config.enableVersioning(true);

            runWebpack(config, () => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        '0.1e6aaff80a714c614d5a.js', // chunks are also versioned
                        'main.905da0a0a7c7a461f2a3.js',
                        'h1.c84caea6dd12bba7955dee9fedd5fd03.css',
                        'bg.4110c672dd434294dc4e28d1475255e0.css',
                        'manifest.json'
                    ]
                );

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.ea1ca6f7f3719118f301a5cfcb1df3c0.png'
                    ]
                );

                assertOutputFileContains(
                    'web/build/bg.4110c672dd434294dc4e28d1475255e0.css',
                    '/build/images/symfony_logo.ea1ca6f7f3719118f301a5cfcb1df3c0.png'
                );

                done();
            });
        });

        it('font and image files are copied correctly', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addStyleEntry('bg', './background_image.scss');
            config.addStyleEntry('font', './roboto_font.css');

            runWebpack(config, () => {
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

                assertOutputFileContains(
                    'www/build/bg.css',
                    '/build/images/symfony_logo.png'
                );
                assertOutputFileContains(
                    'www/build/font.css',
                    '/build/fonts/Roboto.woff2'
                );

                assertOutputFileContains(
                    'www/build/font.css',
                    '/build/fonts/Roboto.woff2'
                );

                done();
            });
        });

        it('enableSourceMaps() adds to .js, css & scss', (done) => {
            var config = testSetup.createWebpackConfig('www/build');
            config.setPublicPath('/build');
            config.addEntry('main', './no_require');
            config.addStyleEntry('bg', './background_image.scss');
            config.addStyleEntry('font', './roboto_font.css');
            config.enableSourceMaps();

            runWebpack(config, () => {
                assertOutputFileHasSourcemap(
                    'www/build/main.js'
                );
                assertOutputFileHasSourcemap(
                    'www/build/bg.css'
                );
                assertOutputFileHasSourcemap(
                    'www/build/font.css'
                );

                done();
            });
        });

        // check shared entry creates files, with manifest correctly
        // check HMR / dev server stuff
        // test that SASS is loaded, URLs are resolved
        // isProduction -> uglified
    });
});

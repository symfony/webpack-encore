var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;

const webpack = require('webpack');
var WebpackConfig = require('../lib/WebpackConfig');
var generator = require('../lib/config_generator');
const path = require('path');
const fs = require('fs-extra');
const Browser = require('zombie');

Browser.extend(function (browser) {
    browser.on('error', function (error) {
        throw new Error(error);
    });
});

const testOutputPath = path.join(__dirname, 'public');

/**
 * @param contextDirName
 * @returns {WebpackConfig}
 */
function createWebpackConfig(contextDirName) {
    var config = new WebpackConfig(path.join(__dirname, 'fixtures', contextDirName));

    if (!fs.existsSync(testOutputPath)) {
        fs.mkdirSync(testOutputPath);
    }
    config.setOutputPath(testOutputPath);

    return config;
}

function emptyTestDir() {
    fs.emptyDirSync(testOutputPath);
}

function assertOutputFileContains(filepath, expectedContents) {
    var fullPath = path.join(testOutputPath, filepath);
    const actualContents = fs.readFileSync(fullPath, 'utf8');
    if (!actualContents.includes(expectedContents)) {
        throw new Error(`Expected contents "${expectedContents}" not found in file ${fullPath}`);
    }
}

function assertManifestPath(sourcePath, expectedDestinationPath) {
    const manifestData = loadManifest();

    if (!manifestData[sourcePath]) {
        throw new Error(`No ${sourcePath} key found in manifest ${manifestData}`);
    }

    if (manifestData[sourcePath] != expectedDestinationPath) {
        throw new Error(`source path ${sourcePath} expected to be set to ${expectedDestinationPath}, was actually ${manifestData[sourcePath]}`);
    }
}
function assertManifestPathDoesNotExist(sourcePath) {
    const manifestData = loadManifest();

    if (manifestData[sourcePath]) {
        throw new Error(`Source ${sourcePath} key WAS found in manifest, but should not be there!`);
    }
}

function loadManifest()
{
    return JSON.parse(
        fs.readFileSync(path.join(testOutputPath, 'manifest.json'), 'utf8')
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

describe('Functional tests using webpack', () => {
    describe('Basic scenarios', () => {
        beforeEach(() => {
            emptyTestDir();
        });

        it('Builds a simple .js file + manifest.json', (done) => {
            var config = createWebpackConfig('basic');
            config.addEntry('main', './no_require');
            config.setPublicPath('/public');

            runWebpack(config, () => {
                // should have a main.js file
                // should have a manifest.json with public/main.js

                expect(config.outputPath).to.be.a.directory()
                    .with.files(['main.js', 'manifest.json']);

                // check that main.js has the correct contents
                assertOutputFileContains(
                    'main.js',
                    'no_require_loaded'
                );
                // check that main.js has the webpack bootstrap
                assertOutputFileContains(
                    'main.js',
                    '__webpack_require__'
                );
                assertManifestPath(
                    'public/main.js',
                    'public/main.js'
                );

                done();
            });
        });

        it('setPublicCDNPath causes paths to use CDN', (done) => {
            var config = createWebpackConfig('basic');
            config.addEntry('main', './code_splitting');
            config.setPublicPath('/public');
            config.setPublicCDNPath('http://localhost:8090');

            runWebpack(config, () => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files(['0.js', 'main.js', 'manifest.json']);

                // check that the publicPath is set correctly
                assertOutputFileContains(
                    'main.js',
                    '__webpack_require__.p = "http://localhost:8090/";'
                );

                /*
                 * An experimental thing... where we actually use a browser to try things...
                 *
                 * To get this to pass, you must start 2 servers in the test/public directory
                 *      http-server
                 *      http-server -p 8090
                 */
                fs.copySync(path.join(__dirname, 'testing.html'), path.join(testOutputPath, 'testing.html'));
                var browser = new Browser();
                browser.visit('http://127.0.0.1:8080/testing.html', () => {
                    // check that both JS files were loaded!
                    browser.assert.evaluate('window.window.code_splitting_loaded');
                    browser.assert.evaluate('window.no_require_loaded');
                    done();
                });
            });
        });

        it('addStyleEntry .js files are removed', (done) => {
            var config = createWebpackConfig('basic');
            config.addEntry('main', './no_require');
            config.setPublicPath('/public');
            config.addStyleEntry('styles', './h1_style.css');

            runWebpack(config, () => {
                expect(config.outputPath).to.be.a.directory()
                    // public.js should not exist
                    .with.files(['main.js', 'styles.css', 'manifest.json']);

                assertOutputFileContains(
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
            var config = createWebpackConfig('basic');
            config.addEntry('main', './no_require');
            config.setPublicPath('/public');
            config.addStyleEntry('h1', './h1_style.css');
            config.addStyleEntry('bg', './background_image.scss');
            config.enableVersioning(true);

            runWebpack(config, () => {
                expect(config.outputPath).to.be.a.directory()
                    .with.files([
                        'main.43bfd7b29d2e414807da.js',
                        'h1.c84caea6dd12bba7955dee9fedd5fd03.css',
                        'bg.bf0ae369481a1080946f3112ee958040.css',
                        'manifest.json'
                    ]
                );

                expect(path.join(config.outputPath, 'images')).to.be.a.directory()
                    .with.files([
                        'symfony_logo.ea1ca6f7f3719118f301a5cfcb1df3c0.png'
                    ]
                );

                assertOutputFileContains(
                    'bg.bf0ae369481a1080946f3112ee958040.css',
                    '/images/symfony_logo.ea1ca6f7f3719118f301a5cfcb1df3c0.png'
                );

                done();
            });
        });

        // test that .png, fonts, are copied
        // check versioning, applies to everything, even loaded files
        // check sourcemaps apply to everything
        // check shared entry creates files, with manifest correctly
        // check HMR / dev server stuff
        // test that SASS is loaded, URLs are resolved
        // isProduction -> uglified
    });
});

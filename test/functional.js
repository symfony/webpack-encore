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
    const manifestData = JSON.parse(
        fs.readFileSync(path.join(testOutputPath, 'manifest.json'), 'utf8')
    );

    if (!manifestData[sourcePath]) {
        throw new Error(`No ${sourcePath} key found in manifest ${manifestData}`);
    }

    if (manifestData[sourcePath] != expectedDestinationPath) {
        throw new Error(`source path ${sourcePath} expected to be set to ${expectedDestinationPath}, was actually ${manifestData[sourcePath]}`);
    }
}
function runWebpack(webpackConfig, callback) {
    const compiler = webpack(generator(webpackConfig));
    compiler.run((err, stats) => {
        if (err) {
            throw new Error(`Error running webpack! ${err}`);
        }

        callback();
    });
}

describe('Functional tests using webpack', () => {
    describe('Basic scenarios', () => {
        before(() => {
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

                assertOutputFileContains(
                    'main.js',
                    'no_require_loaded'
                );
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

        // test style entry deletes entry
        // check versioning, applies to everything, even loaded files
        // check sourcemaps apply to everything
        // check shared entry creates files, with manifest correctly
        // check HMR / dev server stuff
        // test that SASS is loaded, URLs are resolved
        // test that .png, fonts, are copied
        // isProduction -> uglified
    });
});

var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;

const webpack = require('webpack');
var WebpackConfig = require('../lib/WebpackConfig');
var generator = require('../lib/config_generator');
const path = require('path');
const fs = require('fs-extra');

/**
 * @param contextDirName
 * @returns {WebpackConfig}
 */
function createWebpackConfig(contextDirName) {
    var config = new WebpackConfig(path.join(__dirname, 'fixtures', contextDirName));

    const tmpDir = '/tmp/webpack_testing_'+Math.random();
    fs.mkdirSync(tmpDir);
    config.setOutputPath(tmpDir);

    return config;
}
/**
 * @param {WebpackConfig} webpackConfig
 */
function deleteTmpDir(webpackConfig) {
    fs.remove(webpackConfig.outputPath);
}

function assertOutputFileContains(webpackConfig, filepath, expectedContents) {
    var fullPath = path.join(webpackConfig.outputPath, filepath);
    const actualContents = fs.readFileSync(fullPath, 'utf8');
    if (!actualContents.includes(expectedContents)) {
        throw new Error(`Expected contents "${expectedContents}" not found in file ${path}`);
    }
}

function assertManifestPath(webpackConfig, sourcePath, expectedDestinationPath) {
    const manifestData = JSON.parse(
        fs.readFileSync(path.join(webpackConfig.outputPath, 'manifest.json'), 'utf8')
    );

    if (!manifestData[sourcePath]) {
        throw new Error(`No ${sourcePath} key found in manifest ${manifestData}`);
    }

    if (manifestData[sourcePath] != expectedDestinationPath) {
        throw new Error(`source path ${sourcePath} expected to be set to ${expectedDestinationPath}, was actually ${manifestData[sourcePath]}`);
    }
}

describe('Functional tests using webpack', () => {
    describe('Basic scenarios', () => {
        it('Builds a simple .js file + manifest.json', (done) => {
            var config = createWebpackConfig('basic');
            config.addEntry('main', './foo');
            config.setPublicPath('/public');

            const compiler = webpack(generator(config));
            compiler.run((err, stats) => {
                // should have a main.js file
                // should have a manifest.json with public/main.js

                expect(config.outputPath).to.be.a.directory()
                    .with.files(['main.js', 'manifest.json']);

                assertOutputFileContains(config, 'main.js', "foo = 'bar'");
                assertOutputFileContains(config, 'main.js', '__webpack_require__');
                assertManifestPath(config, 'public/main.js', 'public/main.js');

                deleteTmpDir(config);
                done();
            })
        });
    });
});

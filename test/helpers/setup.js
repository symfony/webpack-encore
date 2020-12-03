/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const WebpackConfig = require('../../lib/WebpackConfig');
const parseRuntime = require('../../lib/config/parse-runtime');
const webpack = require('webpack');
const fs = require('fs-extra');
const Browser = require('zombie');
const httpServer = require('http-server');
const configGenerator = require('../../lib/config-generator');
const validator = require('../../lib/config/validator');
const assertUtil = require('./assert');

const tmpDir = path.join(__dirname, '../', '../', 'test_tmp');
const testFixturesDir = path.join(__dirname, '../', '../', 'fixtures');

let servers = [];

function createTestAppDir(rootDir = tmpDir) {
    const testAppDir = path.join(rootDir, Math.random().toString(36).substring(7));

    // copy the fixtures into this new directory
    fs.copySync(testFixturesDir, testAppDir);

    return testAppDir;
}

/**
 * @param {string} testAppDir The dir from calling createTestAppDir()
 * @param {string} outputDirName
 * @param {string} command The encore command name (e.g. dev)
 * @param {object} argv Additional argv commands
 * @returns {WebpackConfig}
 */
function createWebpackConfig(testAppDir, outputDirName = '', command, argv = {}) {
    argv._ = [command];
    argv.context = testAppDir;
    const runtimeConfig = parseRuntime(
        argv,
        testAppDir
    );

    const config = new WebpackConfig(runtimeConfig);

    const outputPath = path.join(testAppDir, outputDirName);
    // allows us to create a few levels deep without issues
    fs.mkdirsSync(outputPath);
    config.setOutputPath(outputPath);

    return config;
}

function runWebpack(webpackConfig, callback, allowCompilationError = false) {
    const stdoutWrite = process.stdout.write;
    const stdOutContents = [];

    try {
        // Mute stdout
        process.stdout.write = (message) => {
            stdOutContents.push(message);
        };

        validator(webpackConfig);

        const compiler = webpack(configGenerator(webpackConfig));
        compiler.run((err, stats) => {
            // Restore stdout
            process.stdout.write = stdoutWrite;

            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }

                throw new Error('Error running webpack!');
            }

            const info = stats.toJson();

            if (stats.hasErrors() && !allowCompilationError) {
                console.error(info.errors);

                throw new Error('Compilation error running webpack!');
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            callback(assertUtil(webpackConfig), stats, stdOutContents.join('\n'));
        });
    } catch (e) {
        // Restore stdout and then re-throw the exception
        process.stdout.write = stdoutWrite;
        throw e;
    }
}

function emptyTmpDir() {
    fs.emptyDirSync(tmpDir);
}

function touchFileInOutputDir(filename, webpackConfig) {
    const fullPath = path.join(webpackConfig.outputPath, filename);
    fs.ensureDirSync(path.dirname(fullPath));

    fs.writeFileSync(
        fullPath,
        ''
    );
}

function startHttpServer(port, webRoot) {
    var server = httpServer.createServer({
        root: webRoot
    });

    server.listen(port, '0.0.0.0');
    servers.push(server);
}

function stopAllServers() {
    for (let server of servers) {
        server.close();
    }

    servers = [];
}

/**
 * Creates a testing.html file with specified script and link tags,
 * makes a request to it, and executes a callback, passing that
 * the Browser instance used to make the request.
 *
 * @param {string} webRootDir Directory path (e.g. /path/to/public) where the web server should be rooted
 * @param {Array} scriptSrcs  Used to create <script src=""> tags.
 * @param {Function} callback Called after the page was requested.
 * @returns {void}
 */
function requestTestPage(webRootDir, scriptSrcs, callback) {
    var scripts = '';
    for (let scriptSrc of scriptSrcs) {
        scripts += `<script src="${scriptSrc}"></script>`;
    }

    const testHtml = `
<html>
<head>
</head>
<body>
    <div id="app"></div>
    ${scripts}
</body>
</html>
`;

    // write the testing.html file
    fs.writeFileSync(
        path.join(webRootDir, 'testing.html'),
        testHtml
    );

    // start the main local server
    startHttpServer('8080', webRootDir);
    // start a secondary server - can be used as the "CDN"
    startHttpServer('8090', webRootDir);

    const browser = new Browser();
    browser.silent = true;
    browser.on('error', function(error) {
        throw new Error(`Error when running the browser: ${error}`);
    });
    browser.visit('http://127.0.0.1:8080/testing.html', () => {
        stopAllServers();

        // sanity check for failed asset loading
        for (let resource of browser.resources) {
            if (resource.response.status !== 200) {
                throw new Error(`Error: status code ${resource.response.status} when requesting resource ${resource.request.url}`);
            }
        }

        callback(browser);
    });
}

module.exports = {
    createWebpackConfig,
    createTestAppDir,
    runWebpack,
    emptyTmpDir,
    requestTestPage,
    touchFileInOutputDir
};

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import path from 'path';
import WebpackConfig from '../../lib/WebpackConfig.js';
import parseRuntime from '../../lib/config/parse-runtime.js';
import webpack from 'webpack';
import fs from 'fs-extra';
import httpServer from 'http-server';
import configGenerator from '../../lib/config-generator.js';
import validator from '../../lib/config/validator.js';
import { Assert } from './assert.js';

const tmpDir = path.join(import.meta.dirname, '../', '../', 'test_tmp');
const testFixturesDir = path.join(import.meta.dirname, '../', '../', 'fixtures');

let servers = [];

export function createTestAppDir(rootDir = null, subDir = null) {
    const testAppDir = path.join(rootDir ? rootDir : tmpDir, subDir ? subDir : Math.random().toString(36).substring(7));

    // copy the fixtures into this new directory
    fs.copySync(testFixturesDir, testAppDir);

    // Write a default package.json so that this directory has its own
    // package boundary. Without this, the .js fixture files would inherit
    // "type": "module" from the project root's package.json, causing
    // webpack to treat them as strict ESM (requiring fully-specified
    // imports, disabling require.ensure, etc.).
    if (!fs.existsSync(path.join(testAppDir, 'package.json'))) {
        fs.writeFileSync(
            path.join(testAppDir, 'package.json'),
            JSON.stringify({ private: true })
        );
    }

    return testAppDir;
}

/**
 * @param {string} testAppDir The dir from calling createTestAppDir()
 * @param {string} outputDirName
 * @param {string} command The encore command name (e.g. dev)
 * @param {object} argv Additional argv commands
 * @returns {WebpackConfig}
 */
export function createWebpackConfig(testAppDir, outputDirName = '', command, argv = {}) {
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

/**
 * @param {WebpackConfig} webpackConfig
 * @param {object} root0
 * @param {boolean} root0.allowCompilationError
 * @returns {Promise<{ webpackAssert: Assert, stats: import('webpack').Stats, output: string }>}
 */
export async function runWebpack(webpackConfig, { allowCompilationError = false } = {}) {
    const stdoutWrite = process.stdout.write;
    const consoleLog = console.log;
    const consoleWarn = console.warn;
    const stdOutContents = [];

    try {
        // Mute stdout
        process.stdout.write = (...args) => {
            stdOutContents.push(String(args[0]));
            return true;
        };
        console.log = (...args) => stdOutContents.push(args.map((arg) => String(arg)).join(' '));
        console.warn = (...args) => stdOutContents.push(args.map((arg) => String(arg)).join(' '));

        validator(webpackConfig);

        const webpackConfigObj = await configGenerator(webpackConfig);
        const compiler = webpack(webpackConfigObj);
        return await new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                // Restore stdout
                process.stdout.write = stdoutWrite;
                console.log = consoleLog;
                console.warn = consoleWarn;

                if (err) {
                    console.error(err.stack || err);
                    if (err.details) {
                        console.error(err.details);
                    }

                    reject(new Error('Error running webpack!'));
                    return;
                }

                const info = stats.toJson();

                if (stats.hasErrors() && !allowCompilationError) {
                    console.error(info.errors);

                    reject(new Error('Compilation error running webpack!'));
                    return;
                }

                if (stats.hasWarnings()) {
                    console.warn(info.warnings);
                }

                resolve({
                    webpackAssert: new Assert(webpackConfig),
                    stats,
                    output: stdOutContents.join('\n')
                });
            });
        });
    } catch (e) {
        // Restore stdout and then re-throw the exception
        process.stdout.write = stdoutWrite;
        throw e;
    }
}

export function emptyTmpDir() {
    fs.emptyDirSync(tmpDir);
}

export function touchFileInOutputDir(filename, webpackConfig) {
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
 * @param {import('puppeteer').Browser} browser Puppeteer browser instance
 * @param {string} webRootDir Directory path (e.g. /path/to/public) where the web server should be rooted
 * @param {Array} scriptSrcs  Used to create <script src=""> tags.
 * @param {function({
 *      page: import('puppeteer').Page,
 *      loadedResources: Array<{ response: import('puppeteer').HTTPResponse }>}
 * ): void} callback Called after the page was requested.
 * @returns {Promise<void>}
 */
export async function requestTestPage(browser, webRootDir, scriptSrcs, callback) {
    var scripts = '';
    for (let scriptSrc of scriptSrcs) {
        scripts += `<script src="${scriptSrc}"></script>`;
    }

    const testHtml = `<!DOCTYPE html>
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

    const loadedResources = [];

    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    page.on('error', (error) => {
        throw new Error(`Error when running the browser: "${error.message}".`, { cause: error });
    });

    page.on('requestfailed', (request) => {
        throw new Error(`Error "${request.failure().errorText}" when requesting resource "${request.url()}".`);
    });

    page.on('response', (response) => {
        loadedResources.push({
            response,
        });
    });

    await page.goto('http://127.0.0.1:8080/testing.html', {
        waitUntil: 'networkidle0',
    });
    stopAllServers();
    await callback({ page, loadedResources });
    await page.close();
}

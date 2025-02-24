/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import { describe, it, expect, beforeEach, afterEach, chai } from 'vitest';
import getPort from "get-port";
chai.use(require('chai-fs'));
const path = require('path');
const testSetup = require('../helpers/setup');
const fs = require('fs-extra');
const { promisify } = require('util');
const { exec, execSync, spawn } = require('child_process');
const execAsync = promisify(exec);
const projectDir = path.resolve(__dirname, '../', '../');

describe('bin/encore.js', { sequential: true, timeout: 10000 }, function() {
    it('Basic smoke test', async () => {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        try {
            const { stdout, stderr } = await execAsync(`node ${binPath} dev --context=${testDir}`, { cwd: testDir });

            expect(stdout).to.contain('Compiled successfully');
            expect(stdout).not.to.contain('Hash: ');
            expect(stdout).not.to.contain('Version: ');
            expect(stdout).not.to.contain('Time: ');
        } catch (err) {
            throw new Error(`Error executing encore: ${err} ${err.stderr} ${err.stdout}`);
        }
    });

    it('Smoke test using the --json option', async () => {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        try {
            const { stdout, stderr } = await execAsync(`node ${binPath} dev --json --context=${testDir}`, { cwd: testDir });

            let parsedOutput = null;
            try {
                parsedOutput = JSON.parse(stdout);
            } catch (e) {
                throw `Webpack output does not contain a valid JSON object: ${stdout}`;
            }

            expect(parsedOutput).to.be.an('object');
            expect(parsedOutput.modules).to.be.an('array');
            // We expect 4 modules there:
            // - webpack/runtime/chunk loaded
            // - webpack/runtime/jsonp chunk loading
            // - webpack/runtime/hasOwnProperty shorthand
            // - ./js/no_require.js
            expect(parsedOutput.modules.length).to.equal(4);
        } catch (err) {
            throw new Error(`Error executing encore: ${err} ${err.stderr} ${err.stdout}`);
        }
    });

    it('Smoke test using the --profile option', async () => {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        try {
            const { stdout, stderr } = await execAsync(`node ${binPath} dev --profile --context=${testDir}`, { cwd: testDir });

            expect(stdout).to.contain('resolving: ');
            expect(stdout).to.contain('restoring: ');
            expect(stdout).to.contain('integration: ');
            expect(stdout).to.contain('building: ');
        } catch (err) {
            throw new Error(`Error executing encore: ${err} ${err.stderr} ${err.stdout}`);
        }
    });

    it('Smoke test using the --keep-public-path option', async () => {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        try {
            await execAsync(`node ${binPath} dev --keep-public-path --context=${testDir}`, { cwd: testDir });
        } catch (err) {
            throw new Error(`Error executing encore: ${err} ${err.stderr} ${err.stdout}`);
        }
    });

    it('Display an error when calling an unknown method', async () => {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChuck()
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        try {
            await execAsync(`node ${binPath} dev --context=${testDir}`, { cwd: testDir });
            throw new Error('Expected command to fail.');
        } catch (err) {
            expect(err).not.to.be.null;
            expect(err.stdout).to.contain('is not a recognized property');
            expect(err.stdout).to.contain('or method');
            expect(err.stdout).to.contain('Did you mean');
        }
    });

    it('Run the webpack-dev-server successfully', {timeout: 15000}, async () => {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        const abortController = new AbortController();
        const port = await getPort();
        await new Promise(async (resolve, reject) => {
            const node = spawn('node', [binPath, 'dev-server', `--context=${testDir}`, `--port=${port}`], {
                cwd: testDir,
                env: Object.assign({}, process.env, { NO_COLOR: 'true', FORCE_COLOR: 'false' }),
                signal: abortController.signal
            });

            let stdout = '';
            let stderr = '';

            node.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            node.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            node.on('error', (error) => {
                if (error.name !== 'AbortError') {
                    reject(new Error('Error executing encore', { cause: error }));
                }

                expect(stdout).to.contain('Running webpack-dev-server ...');
                expect(stdout).to.contain('Compiled successfully in');
                expect(stdout).to.contain('webpack compiled successfully');

                expect(stderr).to.contain('[webpack-dev-server] Project is running at:');
                expect(stderr).to.contain(`[webpack-dev-server] Loopback: http://localhost:${port}/`);
                expect(stderr).to.contain('[webpack-dev-server] Content not from webpack is served from');

                resolve();
            });

            await new Promise(r => setTimeout(r, 9000));
            abortController.abort();
        })
    });

    describe('Without webpack-dev-server installed', () => {
        beforeEach(() => {
            execSync('yarn remove webpack-dev-server --dev', { cwd: projectDir });
        });

        afterEach(() => {
            // Re-install webpack-dev-server and ensure the project is in a clean state
            execSync('git checkout package.json yarn.lock', { cwd: projectDir });
            execSync('yarn install', { cwd: projectDir });
        });

        it('Throw an error when trying to use the webpack-dev-server if not installed', async () => {
            const testDir = testSetup.createTestAppDir();

            fs.writeFileSync(
                path.join(testDir, 'package.json'),
                `{
                    "devDependencies": {
                        "@symfony/webpack-encore": "*"
                    }
                }`
            );

            fs.writeFileSync(
                path.join(testDir, 'webpack.config.js'),
                `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
        `
            );

            const binPath = path.resolve(projectDir, 'bin', 'encore.js');
            try {
                 await execAsync(`node ${binPath} dev-server --context=${testDir}`, {
                    cwd: testDir,
                    env: Object.assign({}, process.env, { NO_COLOR: 'true' })
                });

                throw new Error('Expected command to fail.');
            } catch (err) {
                if (!'stdout' in err || !'stderr' in err) {
                    throw new Error(`Error executing encore: ${err}`);
                }

                expect(err.stdout).to.contain('Install webpack-dev-server to use the webpack Development Server');
                expect(err.stdout).to.contain('npm install webpack-dev-server --save-dev');
                expect(err.stderr).to.equal('');

                expect(err.stdout).not.to.contain('Running webpack-dev-server ...');
                expect(err.stdout).not.to.contain('Compiled successfully in');
                expect(err.stdout).not.to.contain('webpack compiled successfully');
            }
        });
    });
});

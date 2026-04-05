/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import getPort from 'get-port';
import { promisify } from 'node:util';
import child_process from 'node:child_process';
import * as testSetup from '../helpers/setup.js';

const exec = promisify(child_process.exec);

const projectDir = path.resolve(import.meta.dirname, '../', '../');

describe.sequential('bin/encore.js', function() {
    // being functional tests, these can take quite long

    it('Basic smoke test', async function() {
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
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(import.meta.dirname, '../', '../', 'bin', 'encore.js');
        const { stdout } = await exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir });

        expect(stdout).toContain('Compiled successfully');

        expect(stdout).not.toContain('Hash: ');
        expect(stdout).not.toContain('Version: ');
        expect(stdout).not.toContain('Time: ');
    });

    it('Smoke test using the --json option', async function() {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(import.meta.dirname, '../', '../', 'bin', 'encore.js');
        const { stdout } = await exec(`node ${binPath} dev --json --context=${testDir}`, { cwd: testDir });

        let parsedOutput = null;
        try {
            parsedOutput = JSON.parse(stdout);
        } catch {
            throw `Webpack output does not contain a valid JSON object: ${stdout}`;
        }

        expect(parsedOutput).to.be.an('object');
        expect(parsedOutput.modules).to.be.an('array');

        // We expect 4 modules there:
        // - webpack/runtime/chunk loaded
        // - webpack/runtime/jsonp chunk loading
        // - webpack/runtime/hasOwnProperty shorthand
        // - ./js/no_require.js
        expect(parsedOutput.modules.length).toBe(4);
    });

    it('Smoke test using the --profile option', async function() {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(import.meta.dirname, '../', '../', 'bin', 'encore.js');
        const { stdout } = await exec(`node ${binPath} dev --profile --context=${testDir}`, { cwd: testDir });

        expect(stdout).toContain('resolving: ');
        expect(stdout).toContain('restoring: ');
        expect(stdout).toContain('integration: ');
        expect(stdout).toContain('building: ');
    });

    it('Smoke test using the --keep-public-path option', async function() {
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(import.meta.dirname, '../', '../', 'bin', 'encore.js');
        const { stdout } = await exec(`node ${binPath} dev --keep-public-path --context=${testDir}`, { cwd: testDir });

        expect(stdout).toContain('Compiled successfully');
    });

    it('Display an error when calling an unknown method', async function() {
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
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChuck()
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(import.meta.dirname, '../', '../', 'bin', 'encore.js');
        try {
            await exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir });
        } catch (err) {
            expect(err.stdout).toContain('is not a recognized property');
            expect(err.stdout).toContain('or method');
            expect(err.stdout).toContain('Did you mean');
            return;
        }

        throw new Error('This code should not be executed, it means that the `try` bloc didn\'t throw an exception.');
    });

    it('Run the webpack-dev-server successfully', async function() {
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
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(import.meta.dirname, '../', '../', 'bin', 'encore.js');
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, 5000);

        try {
            await exec(`node ${binPath} dev-server --context=${testDir} --port=${await getPort()}`, {
                cwd: testDir,
                env: Object.assign({}, process.env, { NO_COLOR: 'true' }),
                signal: abortController.signal,
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                throw new Error('Error executing encore', { cause: err });
            }
            expect(err.stdout).toContain('Running webpack-dev-server ...');
            expect(err.stdout).toContain('Compiled successfully in');
            expect(err.stdout).toContain('webpack compiled successfully');

            expect(err.stderr).toContain('[webpack-dev-server] Project is running at:');
            expect(err.stderr).toContain('[webpack-dev-server] Loopback: http://localhost:8080/');
            expect(err.stderr).toContain('[webpack-dev-server] Content not from webpack is served from');

            // Verify entrypoints.json contains http:// URLs
            const entrypoints = JSON.parse(fs.readFileSync(path.join(testDir, 'build', 'entrypoints.json'), 'utf8'));
            expect(entrypoints.entrypoints.main.js[0]).toContain('http://localhost:8080/build/');

            // Verify manifest.json contains http:// URLs
            const manifest = JSON.parse(fs.readFileSync(path.join(testDir, 'build', 'manifest.json'), 'utf8'));
            expect(manifest['build/main.js']).toContain('http://localhost:8080/build/');
        }
    });

    it('Run the webpack-dev-server with --server-type https', async function() {
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
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(import.meta.dirname, '../', '../', 'bin', 'encore.js');
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort();
        }, 5000);

        try {
            await exec(`node ${binPath} dev-server --server-type https --context=${testDir} --port=${await getPort()}`, {
                cwd: testDir,
                env: Object.assign({}, process.env, { NO_COLOR: 'true' }),
                signal: abortController.signal,
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                throw new Error('Error executing encore', { cause: err });
            }

            expect(err.stdout).toContain('Running webpack-dev-server ...');
            expect(err.stdout).toContain('Compiled successfully in');
            expect(err.stdout).toContain('webpack compiled successfully');

            expect(err.stderr).toContain('[webpack-dev-server] Project is running at:');
            expect(err.stderr).toContain('[webpack-dev-server] Loopback: https://localhost:8080/');
            expect(err.stderr).toContain('[webpack-dev-server] Content not from webpack is served from');

            // Verify entrypoints.json contains https:// URLs
            const entrypoints = JSON.parse(fs.readFileSync(path.join(testDir, 'build', 'entrypoints.json'), 'utf8'));
            expect(entrypoints.entrypoints.main.js[0]).toContain('https://localhost:8080/build/');

            // Verify manifest.json contains https:// URLs
            const manifest = JSON.parse(fs.readFileSync(path.join(testDir, 'build', 'manifest.json'), 'utf8'));
            expect(manifest['build/main.js']).toContain('https://localhost:8080/build/');
        }
    });

    describe('Without webpack-dev-server installed', function() {
        beforeAll(async function() {
            await exec('yarn remove webpack-dev-server --dev', { cwd: projectDir });
        });

        afterAll(async function() {
            // Re-install webpack-dev-server and ensure the project is in a clean state
            await exec('git checkout package.json yarn.lock', { cwd: projectDir });
            await exec('yarn install', { cwd: projectDir });
        });

        it('Throw an error when trying to use the webpack-dev-server if not installed', async function() {
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
import Encore from '../../index.js';
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

export default await Encore.getWebpackConfig();
        `
            );

            const binPath = path.resolve(projectDir, 'bin', 'encore.js');
            try {
                await exec(`node ${binPath} dev-server --context=${testDir} --port=${await getPort()}`, {
                    cwd: testDir,
                    env: Object.assign({}, process.env, { NO_COLOR: 'true' })
                });
            } catch (err) {
                expect(err.stdout).toContain('Install webpack-dev-server to use the webpack Development Server');
                expect(err.stdout).toContain('npm install webpack-dev-server --save-dev');
                expect(err.stdout).not.toContain('Running webpack-dev-server ...');
                expect(err.stdout).not.toContain('Compiled successfully in');
                expect(err.stdout).not.toContain('webpack compiled successfully');
            }
        });
    });
});

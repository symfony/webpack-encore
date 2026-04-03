/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect, beforeAll, afterAll, vi } from 'vitest';
import path from 'path';
import * as testSetup from '../helpers/setup.js';
import fs from 'fs-extra';
import { exec, execSync, spawn } from 'child_process';

const projectDir = path.resolve(import.meta.dirname, '../', '../');

describe.sequential('bin/encore.js', function() {
    // being functional tests, these can take quite long

    it('Basic smoke test', function(done) {
        testSetup.emptyTmpDir();
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
        exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

            expect(stdout).toContain('Compiled successfully');

            expect(stdout).not.toContain('Hash: ');
            expect(stdout).not.toContain('Version: ');
            expect(stdout).not.toContain('Time: ');

            done();
        });
    });

    it('Smoke test using the --json option', function(done) {
        testSetup.emptyTmpDir();
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
        exec(`node ${binPath} dev --json --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

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


            done();
        });
    });

    it('Smoke test using the --profile option', function(done) {
        testSetup.emptyTmpDir();
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
        exec(`node ${binPath} dev --profile --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

            expect(stdout).toContain('resolving: ');
            expect(stdout).toContain('restoring: ');
            expect(stdout).toContain('integration: ');
            expect(stdout).toContain('building: ');

            done();
        });
    });

    it('Smoke test using the --keep-public-path option', function(done) {
        testSetup.emptyTmpDir();
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
        exec(`node ${binPath} dev --keep-public-path --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

            done();
        });
    });

    it('Display an error when calling an unknown method', function(done) {
        testSetup.emptyTmpDir();
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
        exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            expect(err).not.toBeNull();
            expect(stdout).toContain('is not a recognized property');
            expect(stdout).toContain('or method');
            expect(stdout).toContain('Did you mean');
            done();
        });
    });

    it('Run the webpack-dev-server successfully', function(done) {
        testSetup.emptyTmpDir();
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
        const node = spawn('node', [binPath, 'dev-server', `--context=${testDir}`], {
            cwd: testDir,
            env: Object.assign({}, process.env, { NO_COLOR: 'true' }),
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
                throw new Error('Error executing encore', { cause: error });
            }

            expect(stdout).toContain('Running webpack-dev-server ...');
            expect(stdout).toContain('Compiled successfully in');
            expect(stdout).toContain('webpack compiled successfully');

            expect(stderr).toContain('[webpack-dev-server] Project is running at:');
            expect(stderr).toContain('[webpack-dev-server] Loopback: http://localhost:8080/');
            expect(stderr).toContain('[webpack-dev-server] Content not from webpack is served from');

            // Verify entrypoints.json contains http:// URLs
            const entrypoints = JSON.parse(
                fs.readFileSync(path.join(testDir, 'build', 'entrypoints.json'), 'utf8')
            );
            expect(entrypoints.entrypoints.main.js[0]).toContain('http://localhost:8080/build/');

            // Verify manifest.json contains http:// URLs
            const manifest = JSON.parse(
                fs.readFileSync(path.join(testDir, 'build', 'manifest.json'), 'utf8')
            );
            expect(manifest['build/main.js']).toContain('http://localhost:8080/build/');

            done();
        });

        setTimeout(() => {
            abortController.abort();
        }, 5000);
    });

    it('Run the webpack-dev-server with --server-type https', function(done) {
        testSetup.emptyTmpDir();
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
        const node = spawn('node', [binPath, 'dev-server', '--server-type', 'https', `--context=${testDir}`], {
            cwd: testDir,
            env: Object.assign({}, process.env, { NO_COLOR: 'true' }),
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
                throw new Error('Error executing encore', { cause: error });
            }

            expect(stdout).toContain('Running webpack-dev-server ...');
            expect(stdout).toContain('Compiled successfully in');
            expect(stdout).toContain('webpack compiled successfully');

            expect(stderr).toContain('[webpack-dev-server] Project is running at:');
            expect(stderr).toContain('[webpack-dev-server] Loopback: https://localhost:8080/');
            expect(stderr).toContain('[webpack-dev-server] Content not from webpack is served from');

            // Verify entrypoints.json contains https:// URLs
            const entrypoints = JSON.parse(
                fs.readFileSync(path.join(testDir, 'build', 'entrypoints.json'), 'utf8')
            );

            expect(entrypoints.entrypoints.main.js[0]).toContain('https://localhost:8080/build/');

            // Verify manifest.json contains https:// URLs
            const manifest = JSON.parse(
                fs.readFileSync(path.join(testDir, 'build', 'manifest.json'), 'utf8')
            );
            expect(manifest['build/main.js']).toContain('https://localhost:8080/build/');

            done();
        });

        setTimeout(() => {
            abortController.abort();
        }, 5000);
    });

    describe('Without webpack-dev-server installed', function() {
        beforeAll(function() {
            execSync('yarn remove webpack-dev-server --dev', { cwd: projectDir });
        });

        afterAll(function() {
            // Re-install webpack-dev-server and ensure the project is in a clean state
            execSync('git checkout package.json', { cwd: projectDir });
            execSync('yarn install', { cwd: projectDir });
        });

        it('Throw an error when trying to use the webpack-dev-server if not installed', function(done) {
            testSetup.emptyTmpDir();
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
            exec(
                `node ${binPath} dev-server --context=${testDir}`,
                {
                    cwd: testDir,
                    env: Object.assign({}, process.env, { NO_COLOR: 'true' })
                },
                (err, stdout, stderr) => {
                    expect(stdout).toContain('Install webpack-dev-server to use the webpack Development Server');
                    expect(stdout).toContain('npm install webpack-dev-server --save-dev');
                    expect(stderr).toBe('');

                    expect(stdout).not.toContain('Running webpack-dev-server ...');
                    expect(stdout).not.toContain('Compiled successfully in');
                    expect(stdout).not.toContain('webpack compiled successfully');

                    done();
                });
        });
    });
});

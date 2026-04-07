/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import path from 'path';

import fs from 'fs-extra';
import { describe, it, expect } from 'vitest';
import yargsParser from 'yargs-parser';

import parseArgv from '../../lib/config/parse-runtime.js';
import WebpackConfig from '../../lib/WebpackConfig.js';
import * as testSetup from '../helpers/setup.js';

function createArgv(argv) {
    return yargsParser(argv);
}

function createTestDirectory() {
    const projectDir = testSetup.createTestAppDir();
    fs.writeFileSync(path.join(projectDir, 'package.json'), '{}');

    return projectDir;
}

describe('parse-runtime', function () {
    it('Basic usage', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['foobar', '--bar', '--help']), testDir);

        expect(config.command).toBe('foobar');
        expect(config.context).toBe(testDir);
        expect(config.helpRequested).toBe(true);
        expect(config.isValidCommand).toBe(false);
        // babelRcFileExists detection is deferred to build time
        expect(config.babelRcFileExists).toBeNull();
    });

    it('dev command', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev', '--bar']), testDir);

        expect(config.environment).toBe('dev');
        expect(config.isValidCommand).toBe(true);
    });

    it('production command', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['production', '--bar']), testDir);

        expect(config.environment).toBe('production');
        expect(config.isValidCommand).toBe(true);
    });

    it('dev-server command', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--bar']), testDir);

        expect(config.environment).toBe('dev');
        expect(config.useDevServer).toBe(true);
        expect(config.devServerHost).toBe('localhost');
        expect(config.devServerPort).toBe('8080');
        expect(config.devServerKeepPublicPath).toBe(false);
        expect(config.devServerPublic).toBeNull();
    });

    it('dev-server command with options', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(
            createArgv(['dev-server', '--bar', '--host', 'foohost.l', '--port', '9999']),
            testDir
        );

        expect(config.environment).toBe('dev');
        expect(config.devServerHost).toBe('foohost.l');
        expect(config.devServerPort).toBe(9999);
    });

    it('dev-server command server-type https', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(
            createArgv([
                'dev-server',
                '--server-type',
                'https',
                '--host',
                'foohost.l',
                '--port',
                '9999',
            ]),
            testDir
        );

        expect(config.useDevServer).toBe(true);
        expect(config.devServerServerType).toBe('https');
        expect(config.devServerHost).toBe('foohost.l');
        expect(config.devServerPort).toBe(9999);
    });

    it('dev-server command public', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(
            createArgv(['dev-server', '--public', 'https://my-domain:8080']),
            testDir
        );

        expect(config.devServerPublic).toBe('https://my-domain:8080');
    });

    it('--context is parsed correctly', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev', '--context', '/tmp/custom-context']), testDir);

        expect(config.context).toBe('/tmp/custom-context');
    });

    it('babel config in package.json detected when present', async function () {
        const projectDir = createTestDirectory();
        fs.writeFileSync(path.join(projectDir, 'package.json'), '{"babel": {}}');

        const runtimeConfig = parseArgv(createArgv(['dev']), projectDir);
        const webpackConfig = new WebpackConfig(runtimeConfig);

        expect(await webpackConfig.doesBabelRcFileExist()).toBe(true);
    });

    it('.babelrc detected when present', async function () {
        const projectDir = createTestDirectory();
        fs.writeFileSync(path.join(projectDir, '.babelrc'), '{}');

        const runtimeConfig = parseArgv(createArgv(['dev']), projectDir);
        const webpackConfig = new WebpackConfig(runtimeConfig);

        expect(await webpackConfig.doesBabelRcFileExist()).toBe(true);
    });

    it('babel.config.json detected when present', async function () {
        const projectDir = createTestDirectory();
        fs.writeFileSync(path.join(projectDir, 'babel.config.json'), '{}');

        const runtimeConfig = parseArgv(createArgv(['dev']), projectDir);
        const webpackConfig = new WebpackConfig(runtimeConfig);

        expect(await webpackConfig.doesBabelRcFileExist()).toBe(true);
    });

    it('dev-server command --keep-public-path', function () {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--keep-public-path']), testDir);

        expect(config.useDevServer).toBe(true);
        expect(config.devServerKeepPublicPath).toBe(true);
    });
});

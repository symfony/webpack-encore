/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import parseArgv from '../../lib/config/parse-runtime.js';
import WebpackConfig from '../../lib/WebpackConfig.js';
import * as testSetup from '../helpers/setup.js';
import fs from 'fs-extra';
import path from 'path';
import yargsParser from 'yargs-parser';

function createArgv(argv) {
    return yargsParser(argv);
}

function createTestDirectory() {
    const projectDir = testSetup.createTestAppDir();
    fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        '{}'
    );

    return projectDir;
}

describe('parse-runtime', function() {
    beforeEach(function() {
        testSetup.emptyTmpDir();
    });

    it('Basic usage', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['foobar', '--bar', '--help']), testDir);

        expect(config.command).to.equal('foobar');
        expect(config.context).to.equal(testDir);
        expect(config.helpRequested).to.be.true;
        expect(config.isValidCommand).to.be.false;
        // babelRcFileExists detection is deferred to build time
        expect(config.babelRcFileExists).to.be.null;
    });

    it('dev command', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev', '--bar']), testDir);

        expect(config.environment).to.equal('dev');
        expect(config.isValidCommand).to.be.true;
    });

    it('production command', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['production', '--bar']), testDir);

        expect(config.environment).to.equal('production');
        expect(config.isValidCommand).to.be.true;
    });

    it('dev-server command', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--bar']), testDir);

        expect(config.environment).to.equal('dev');
        expect(config.useDevServer).to.be.true;
        expect(config.devServerHost).to.equal('localhost');
        expect(config.devServerPort).to.equal('8080');
        expect(config.devServerKeepPublicPath).to.be.false;
        expect(config.devServerPublic).to.be.null;
    });

    it('dev-server command with options', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--bar', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.environment).to.equal('dev');
        expect(config.devServerHost).to.equal('foohost.l');
        expect(config.devServerPort).to.equal(9999);
    });

    it('dev-server command server-type https', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--server-type', 'https', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerServerType).to.equal('https');
        expect(config.devServerHost).to.equal('foohost.l');
        expect(config.devServerPort).to.equal(9999);
    });

    it('dev-server command public', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--public', 'https://my-domain:8080']), testDir);

        expect(config.devServerPublic).to.equal('https://my-domain:8080');
    });

    it('--context is parsed correctly', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev', '--context', '/tmp/custom-context']), testDir);

        expect(config.context).to.equal('/tmp/custom-context');
    });

    it('babel config in package.json detected when present', async function() {
        const projectDir = createTestDirectory();
        fs.writeFileSync(
            path.join(projectDir, 'package.json'),
            '{"babel": {}}'
        );

        const runtimeConfig = parseArgv(createArgv(['dev']), projectDir);
        const webpackConfig = new WebpackConfig(runtimeConfig);

        expect(await webpackConfig.doesBabelRcFileExist()).to.be.true;
    });

    it('.babelrc detected when present', async function() {
        const projectDir = createTestDirectory();
        fs.writeFileSync(
            path.join(projectDir, '.babelrc'),
            '{}'
        );

        const runtimeConfig = parseArgv(createArgv(['dev']), projectDir);
        const webpackConfig = new WebpackConfig(runtimeConfig);

        expect(await webpackConfig.doesBabelRcFileExist()).to.be.true;
    });

    it('babel.config.json detected when present', async function() {
        const projectDir = createTestDirectory();
        fs.writeFileSync(
            path.join(projectDir, 'babel.config.json'),
            '{}'
        );

        const runtimeConfig = parseArgv(createArgv(['dev']), projectDir);
        const webpackConfig = new WebpackConfig(runtimeConfig);

        expect(await webpackConfig.doesBabelRcFileExist()).to.be.true;
    });

    it('dev-server command --keep-public-path', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--keep-public-path']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerKeepPublicPath).to.be.true;
    });
});

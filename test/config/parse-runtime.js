/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const expect = require('chai').expect;
const parseArgv = require('../../lib/config/parse-runtime');
const testSetup = require('../helpers/setup');
const fs = require('fs-extra');
const path = require('path');

function createArgv(argv) {
    return require('yargs/yargs')(argv).argv;
}

function createTestDirectory() {
    const projectDir = testSetup.createTestAppDir();
    fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        '{}'
    );

    return projectDir;
}

describe('parse-runtime', () => {
    beforeEach(() => {
        testSetup.emptyTmpDir();
    });

    it('Basic usage', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['foobar', '--bar', '--help']), testDir);

        expect(config.command).to.equal('foobar');
        expect(config.context).to.equal(testDir);
        expect(config.helpRequested).to.be.true;
        expect(config.isValidCommand).to.be.false;
        expect(config.babelRcFileExists).to.be.false;
    });

    it('dev command', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev', '--bar']), testDir);

        expect(config.environment).to.equal('dev');
        expect(config.isValidCommand).to.be.true;
    });

    it('production command', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['production', '--bar']), testDir);

        expect(config.environment).to.equal('production');
        expect(config.isValidCommand).to.be.true;
    });

    it('dev-server command', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--bar']), testDir);

        expect(config.environment).to.equal('dev');
        expect(config.useDevServer).to.be.true;
        expect(config.devServerUrl).to.equal('http://localhost:8080/');
        expect(config.useHotModuleReplacement).to.be.false;
        expect(config.devServerKeepPublicPath).to.be.false;
    });

    it('dev-server command with options', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--bar', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.environment).to.equal('dev');
        expect(config.useDevServer).to.be.true;
        expect(config.devServerUrl).to.equal('http://foohost.l:9999/');
    });

    it('dev-server command https', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--https', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerUrl).to.equal('https://foohost.l:9999/');
    });

    it('--context is parsed correctly', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev', '--context', '/tmp/custom-context']), testDir);

        expect(config.context).to.equal('/tmp/custom-context');
    });

    it('.babelrc detected when present', () => {
        const projectDir = createTestDirectory();
        fs.writeFileSync(
            path.join(projectDir, '.babelrc'),
            '{}'
        );

        const config = parseArgv(createArgv(['dev']), projectDir);

        expect(config.babelRcFileExists).to.be.true;
    });

    it('dev-server command hot', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--hot']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.useHotModuleReplacement).to.be.true;
    });

    it('dev-server command --keep-public-path', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--keep-public-path']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerKeepPublicPath).to.be.true;
    });
});

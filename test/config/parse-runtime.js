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
    return require('yargs-parser')(argv);
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
        expect(config.babelRcFileExists).to.be.false;
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
        expect(config.devServerHttps).to.be.null;
    });

    it('dev-server command https', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--https', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerHost).to.equal('foohost.l');
        expect(config.devServerPort).to.equal(9999);
        expect(config.devServerHttps).to.equal(true);
    });

    it('dev-server command server-type https', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--server-type', 'https', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerHost).to.equal('foohost.l');
        expect(config.devServerPort).to.equal(9999);
        expect(config.devServerHttps).to.equal(true);
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

    it('babel config in package.json detected when present', function() {
        const projectDir = createTestDirectory();
        fs.writeFileSync(
            path.join(projectDir, 'package.json'),
            '{"babel": {}}'
        );

        const config = parseArgv(createArgv(['dev']), projectDir);

        expect(config.babelRcFileExists).to.be.true;
    });

    it('.babelrc detected when present', function() {
        const projectDir = createTestDirectory();
        fs.writeFileSync(
            path.join(projectDir, '.babelrc'),
            '{}'
        );

        const config = parseArgv(createArgv(['dev']), projectDir);

        expect(config.babelRcFileExists).to.be.true;
    });

    it('babel.config.json detected when present', function() {
        const projectDir = createTestDirectory();
        fs.writeFileSync(
            path.join(projectDir, 'babel.config.json'),
            '{}'
        );

        const config = parseArgv(createArgv(['dev']), projectDir);

        expect(config.babelRcFileExists).to.be.true;
    });

    it('dev-server command --keep-public-path', function() {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--keep-public-path']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerKeepPublicPath).to.be.true;
    });
});

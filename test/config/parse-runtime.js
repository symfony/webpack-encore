const expect = require('chai').expect;
const parseArgv = require('../../lib/config/parse-runtime');
const testSetup = require('../../lib/test/setup');
const fs = require('fs-extra');
const path = require('path');

createArgv = function(argv) {
    return require('yargs/yargs')(argv).argv;
};

createTestDirectory= function() {
    const projectDir = testSetup.createTestProjectDir();
    fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        ''
    );
};

describe('parse-runtime', () => {
    beforeEach(() => {
        testSetup.emptyTestDir();
    });

    it('Basic usage', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['fooCommand', '--bar', '--help']), testDir);

        expect(config.command).to.equal('fooCommand');
        expect(config.context).to.equal(testDir);
        expect(config.helpRequested).to.be.true;
        expect(config.isValidCommand).to.be.false;
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
        const config = parseArgv(createArgv(['dev-server', '--bar', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.environment).to.equal('dev');
        expect(config.useDevServer).to.be.true;
        expect(config.devServerUrl).to.equal('http://foohost.l:9999')
    });

    it('dev-server command https', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev-server', '--https', '--host', 'foohost.l', '--port', '9999']), testDir);

        expect(config.useDevServer).to.be.true;
        expect(config.devServerUrl).to.equal('https://foohost.l:9999')
    });

    it('--context is parsed correctly', () => {
        const testDir = createTestDirectory();
        const config = parseArgv(createArgv(['dev', '--context', '/tmp/custom-context']), testDir);

        expect(config.context).to.equal('/tmp/custom-context');
    });
});

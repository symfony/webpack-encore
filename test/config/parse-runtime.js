const expect = require('chai').expect;
const parseArgv = require('../../lib/config/parse-runtime');

createArgv = function(argv) {
    return require('yargs/yargs')(argv).argv;
};

describe('parse-runtime', () => {
    it('Basic usage', () => {
        const config = parseArgv(createArgv(['fooCommand', '--bar', '--help']));

        expect(config.command).to.equal('fooCommand');
        expect(config.helpRequested).to.be.true;
        expect(config.isValidCommand).to.be.false;
    });

    it('dev command', () => {
        const config = parseArgv(createArgv(['dev', '--bar']));

        expect(config.environment).to.equal('dev');
        expect(config.isValidCommand).to.be.true;
    });

    it('production command', () => {
        const config = parseArgv(createArgv(['production', '--bar']));

        expect(config.environment).to.equal('production');
        expect(config.isValidCommand).to.be.true;
    });

    it('dev-server command', () => {
        const config = parseArgv(createArgv(['dev-server', '--bar', '--host', 'foohost.l', '--port', '9999']));

        expect(config.environment).to.equal('dev');
        expect(config.useDevServer).to.be.true;
        expect(config.devServerUrl).to.equal('http://foohost.l:9999')
    });

    it('dev-server command https', () => {
        const config = parseArgv(createArgv(['dev-server', '--https', '--host', 'foohost.l', '--port', '9999']));

        expect(config.useDevServer).to.be.true;
        expect(config.devServerUrl).to.equal('https://foohost.l:9999')
    });
});

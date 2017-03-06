var expect    = require('chai').expect;
var WebpackConfig = require('../lib/WebpackConfig');

describe('WebpackConfig object', () => {

    describe('setOutput', () => {
        it('use absolute, existent path', () => {
            var config = new WebpackConfig();
            config.setOutputPath(__dirname);

            expect(config.outputPath).to.equal(__dirname);
        });
    });
});

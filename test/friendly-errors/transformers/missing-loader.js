const expect = require('chai').expect;
const transform = require('../../../lib/friendly-errors/transformers/missing-loader');

describe('transform/missing-loader', () => {

    describe('test transform', () => {
        it('Error not with "ModuleParseError" name is ignored', () => {
            const startError = {
                name: 'OtherParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error not containing "appropriate loader" is ignored', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'Some other message',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Error with unsupported file extension is ignored', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.jpg'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError).to.deep.equal(startError);
        });

        it('Matching error is properly transformed', () => {
            const startError = {
                name: 'ModuleParseError',
                message: 'You may need an appropriate loader',
                file: '/path/to/file.sass'
            };
            const actualError = transform(Object.assign({}, startError));

            expect(actualError.name).to.deep.equal('Loader not enabled');
            expect(actualError.loaderName).to.deep.equal('sass');
        });
    });
});

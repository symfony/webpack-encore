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
const getFileExtension = require('../../lib/utils/get-file-extension');

describe('get-file-extension', function() {
    it('returns the extension of simple filenames', function() {
        expect(getFileExtension('foo.js')).to.equal('js');
        expect(getFileExtension('foo-bar.txt')).to.equal('txt');
        expect(getFileExtension('foo.bar.baz')).to.equal('baz');
    });

    it('returns an empty string for files with no extension', function() {
        expect(getFileExtension('foo')).to.equal('');
        expect(getFileExtension('foo-bar')).to.equal('');
    });

    it('returns the extension of a file from an absolute path', function() {
        expect(getFileExtension('/home/foo/bar.js')).to.equal('js');
        expect(getFileExtension('C:\\home\\foo\\bar.js')).to.equal('js');
    });

    it('returns the extension from an URI', function() {
        expect(getFileExtension('http://localhost/foo.js')).to.equal('js');
        expect(getFileExtension('file://localhost/foo/bar.txt')).to.equal('txt');
        expect(getFileExtension('https://localhost:8080/foo.bar.baz')).to.equal('baz');
    });

    it('works with query strings', function() {
        expect(getFileExtension('http://localhost/foo.js?abcd')).to.equal('js');
        expect(getFileExtension('foo.txt?bar=baz&baz=bar')).to.equal('txt');
    });
});

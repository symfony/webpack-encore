/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import getFileExtension from '../../lib/utils/get-file-extension.js';

describe('get-file-extension', function() {
    it('returns the extension of simple filenames', function() {
        expect(getFileExtension('foo.js')).toBe('js');
        expect(getFileExtension('foo-bar.txt')).toBe('txt');
        expect(getFileExtension('foo.bar.baz')).toBe('baz');
    });

    it('returns an empty string for files with no extension', function() {
        expect(getFileExtension('foo')).toBe('');
        expect(getFileExtension('foo-bar')).toBe('');
    });

    it('returns the extension of a file from an absolute path', function() {
        expect(getFileExtension('/home/foo/bar.js')).toBe('js');
        expect(getFileExtension('C:\\home\\foo\\bar.js')).toBe('js');
    });

    it('returns the extension from an URI', function() {
        expect(getFileExtension('http://localhost/foo.js')).toBe('js');
        expect(getFileExtension('file://localhost/foo/bar.txt')).toBe('txt');
        expect(getFileExtension('https://localhost:8080/foo.bar.baz')).toBe('baz');
    });

    it('works with query strings', function() {
        expect(getFileExtension('http://localhost/foo.js?abcd')).toBe('js');
        expect(getFileExtension('foo.txt?bar=baz&baz=bar')).toBe('txt');
    });
});

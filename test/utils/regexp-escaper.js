/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import regexpEscaper from '../../lib/utils/regexp-escaper.js';

describe('regexp-escaper', function() {
    it('escapes things properly', function() {
        expect(regexpEscaper('.*')).toBe('\\.\\*');
        expect(regexpEscaper('[foo]')).toBe('\\[foo\\]');
        expect(regexpEscaper('(foo|bar)')).toBe('\\(foo\\|bar\\)');
        expect(regexpEscaper('foo{2}')).toBe('foo\\{2\\}');
        expect(regexpEscaper('\\foo\\')).toBe('\\\\foo\\\\');
        expect(regexpEscaper('^foo$')).toBe('\\^foo\\$');
        expect(regexpEscaper('foo?')).toBe('foo\\?');
        expect(regexpEscaper('foo+')).toBe('foo\\+');
    });
});

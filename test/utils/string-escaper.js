/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import stringEscaper from '../../lib/utils/string-escaper.js';

function expectEvaledStringToEqual(str, expectedStr) {
    // put the string in quotes & eval it: should match original
    expect(eval(`'${str}'`)).toBe(expectedStr);
}

describe('string-escaper', function() {
    it('escapes filenames with quotes', function() {
        // eslint-disable-next-line quotes
        const filename = "/foo/bar's/stuff";

        const escapedFilename = stringEscaper(filename);
        expectEvaledStringToEqual(escapedFilename, filename);
    });

    it('escapes Windows filenames', function() {
        // eslint-disable-next-line quotes
        const filename = `C:\\path\\to\\file`;

        const escapedFilename = stringEscaper(filename);
        expectEvaledStringToEqual(escapedFilename, filename);
    });
});

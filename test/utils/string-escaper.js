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
const stringEscaper = require('../../lib/utils/string-escaper');

function expectEvaledStringToEqual(str, expectedStr) {
    // put the string in quotes & eval it: should match original
    expect(eval(`'${str}'`)).to.equal(expectedStr);
}

describe('string-escaper', () => {
    it('escapes filenames with quotes', () => {
        // eslint-disable-next-line quotes
        const filename = "/foo/bar's/stuff";

        const escapedFilename = stringEscaper(filename);
        console.log(escapedFilename);
        expectEvaledStringToEqual(escapedFilename, filename);
    });

    it('escapes Windows filenames', () => {
        // eslint-disable-next-line quotes
        const filename = `C:\\path\\to\\file`;
        console.log(filename);

        const escapedFilename = stringEscaper(filename);
        expectEvaledStringToEqual(escapedFilename, filename);
    });
});

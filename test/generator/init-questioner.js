/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const expect = require('chai').expect;
const inq = require('inquirer-test');
const fs = require('fs');

const cliPath = __dirname + '/init-cli-tester.js';
const tmp = require('tmp');

function run(responses) {
    return new Promise((resolve) => {
        const tmpFile = tmp.fileSync();
        responses = [tmpFile.name, inq.ENTER, ...responses];
        inq(cliPath, responses, 500).then(() => {
            resolve(JSON.parse(fs.readFileSync(tmpFile.name)));
        });
    });
}

describe('generator/init-questioner', function() {
    this.timeout(4000);

    it('Use all defaults', () => {
        return run([inq.ENTER, inq.ENTER, inq.ENTER]).then(initConfig => {
            expect(initConfig).to.deep.equal({
                _isSpa: true,
                _cssType: 'CSS_TYPE_SASS',
                _jsType: 'JS_TYPE_VANILLA'
            });
        });
    });

    it('Multi, LESS', () => {
        // down for multi-page, down for LESS
        return run([inq.DOWN, inq.ENTER, inq.DOWN, inq.ENTER]).then(initConfig => {
            expect(initConfig).to.deep.equal({
                _isSpa: false,
                _cssType: 'CSS_TYPE_LESS',
                // JS type defaults to Vanilla
                _jsType: 'JS_TYPE_VANILLA'
            });
        });
    });
});

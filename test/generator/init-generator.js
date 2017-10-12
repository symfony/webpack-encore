/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chai = require('chai');
chai.use(require('chai-fs'));
const expect = chai.expect;
const testSetup = require('../../lib/test/setup');

describe('Functional tests the init generator', function() {
    // being functional tests, these can take quite long
    this.timeout(8000);

    before(() => {
        testSetup.emptyTmpDir();
    });

    describe('init', () => {
        it('init, SPA, vanilla', (done) => {
            const testDir = testSetup.createTestAppDir();

            // todo
        });
    });
});

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
const path = require('path');
const testSetup = require('../../lib/test/setup');
const fs = require('fs-extra');
const exec = require('child_process').exec;

describe('bin/encore.js', function() {
    // being functional tests, these can take quite long
    this.timeout(8000);

    it('Basic smoke test', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .setOutputPath('/build')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

            done();
        });
    });
});

/*
 * This file is part of the Symfony Webpack Encore package.
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
const testSetup = require('../../test/helpers/setup');
const InitConfig = require('../../lib/generator/InitConfig');
const generator = require('../../lib/generator/init-generator');

describe.only('Functional tests the init generator', function() {
    // these tests are VERY slow
    this.timeout(30000);

    before(() => {
        testSetup.emptyTmpDir();
    });

    it('init, SPA, React, CSS', (done) => {
        const testDir = testSetup.createEmptyTestAppDir();
        console.log(testDir);
        const initConfig = new InitConfig(testDir);
        initConfig.outputPath = 'public/build';
        initConfig.publicPath = '/build';
        initConfig.isSpa = true;
        initConfig.cssType = InitConfig.cssTypeCss;
        initConfig.jsType = InitConfig.jsTypeReact;
        initConfig.entryName = 'app';

        generator(initConfig).then(() => {
            // todo assertions on what lives there!

            // todo - run webpack using *that* webpack.config.js
            // file (similar to what we do in functional.js)
            // and verify that a basic page works

            // also lint the webpack.config.js file
            done();
        });
    });
});

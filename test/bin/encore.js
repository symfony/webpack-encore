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
const path = require('path');
const testSetup = require('../helpers/setup');
const fs = require('fs-extra');
const exec = require('child_process').exec;

describe('bin/encore.js', function() {
    // being functional tests, these can take quite long
    this.timeout(10000);

    it('Basic smoke test', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
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

            expect(stdout).to.contain('Compiled successfully');
            expect(stdout).not.to.contain('Webpack is already provided by Webpack Encore');

            expect(stdout).not.to.contain('Hash: ');
            expect(stdout).not.to.contain('Version: ');
            expect(stdout).not.to.contain('Time: ');

            done();
        });
    });

    it('Smoke test using the --json option', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        exec(`node ${binPath} dev --json --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

            let parsedOutput = null;
            try {
                parsedOutput = JSON.parse(stdout);
            } catch (e) {
                throw `Webpack output does not contain a valid JSON object: ${stdout}`;
            }

            expect(parsedOutput).to.be.an('object');
            expect(parsedOutput.modules).to.be.an('array');

            // We expect 4 modules there:
            // - webpack/runtime/chunk loaded
            // - webpack/runtime/jsonp chunk loading
            // - webpack/runtime/hasOwnProperty shorthand
            // - ./js/no_require.js
            expect(parsedOutput.modules.length).to.equal(4);


            done();
        });
    });

    it('Smoke test using the --profile option', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        exec(`node ${binPath} dev --profile --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

            expect(stdout).to.contain('resolving: ');
            expect(stdout).to.contain('restoring: ');
            expect(stdout).to.contain('integration: ');
            expect(stdout).to.contain('building: ');

            done();
        });
    });

    it('Smoke test using the --keep-public-path option', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        exec(`node ${binPath} dev --keep-public-path --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err} ${stderr} ${stdout}`);
            }

            done();
        });
    });

    it('Display a warning message when webpack is also added to the package.json file', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*",
                    "webpack": "*"
                }
            }`
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
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

            expect(stdout).to.contain('Webpack is already provided by Webpack Encore');

            done();
        });
    });

    it('Display an error when calling an unknown method', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChuck()
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `
        );

        const binPath = path.resolve(__dirname, '../', '../', 'bin', 'encore.js');
        exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            expect(err).not.to.be.null;
            expect(stdout).to.contain('is not a recognized property or method');
            expect(stdout).to.contain('Did you mean');
            done();
        });
    });
});

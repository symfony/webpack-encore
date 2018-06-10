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
const packageHelper = require('../lib/package-helper');
const path = require('path');
const process = require('process');

describe('package-helper', () => {
    const baseCwd = process.cwd();

    describe('recommended install command is based on the existing lock files', () => {
        after(() => {
            process.chdir(baseCwd);
        });

        it('missing packages without any lock file', () => {
            process.chdir(path.join(__dirname , '../fixtures/package-helper/empty'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
        });

        it('missing packages with package-lock.json only', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('npm install foo bar');
        });

        it('missing packages with yarn.lock only', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
        });

        it('missing packages with both package-lock.json and yarn.lock', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn-npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
        });
    });

    describe('check messaging on install commands', () => {
        it('Make sure the major version is included in the install command', () => {
            process.chdir(path.join(__dirname , '../fixtures/package-helper/empty'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'bar', version: 3 }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar@^3.0');
        });

    });

    describe('The getInvalidPackageVersionRecommendations correctly checks installed versions', () => {
        it('Check package that *is* the correct version', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: 7 },
                { name: 'preact', version: 8 }
            ]);

            expect(versionProblems).to.be.empty;
        });

        it('Check package with a version too low', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: 8 },
                { name: 'preact', version: 9 }
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too old');
        });

        it('Check package with a version too low', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: 6 },
                { name: 'preact', version: 7 }
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too new');
        });

        it('Missing "version" key is ok', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: 6 },
                { name: 'preact' }
            ]);

            // just sass-loader
            expect(versionProblems).to.have.length(1);
        });
    });
});

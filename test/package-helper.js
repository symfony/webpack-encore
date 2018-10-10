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
const fs = require('fs');

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
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'bar', version: '^3.0' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar@^3.0');
        });

        it('Recommends correct install on 0 version', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^0.1.0' },
                { name: 'bar' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo@^0.1.0 bar');
        });

        it('Recommends correct install with a more complex constraint', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0||^8.0' },
                { name: 'bar' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo@^8.0 bar');
        });

        it('Recommends correct install with a more complex constraint', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0 || ^8.0' },
                { name: 'bar' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo@^8.0 bar');
        });
    });

    describe('The getInvalidPackageVersionRecommendations correctly checks installed versions', () => {
        it('Check package that *is* the correct version', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: '^7.0.1' },
                { name: 'preact', version: '^8.1.0' }
            ]);

            expect(versionProblems).to.be.empty;
        });

        it('Check package with a version too low', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: '^8.0.1' },
                { name: 'preact', version: '9.0.0' }
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too old');
        });

        it('Check package with a version too low', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: '^6.9.11' },
                { name: 'preact', version: '7.0.0' }
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too new');
        });

        it('Missing "version" key is ok', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: '^6.9.9' },
                { name: 'preact' }
            ]);

            // just sass-loader
            expect(versionProblems).to.have.length(1);
        });
    });

    describe('addPackagesVersionConstraint', () => {
        it('Lookup a version constraint', () => {
            const inputPackages = [
                { name: 'sass-loader', enforce_version: 7 },
                { name: 'node-sass' }
            ];

            const packageInfo = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../package.json'))
            );

            const expectedPackages = [
                { name: 'sass-loader', version: packageInfo.devDependencies['sass-loader'] },
                { name: 'node-sass' }
            ];

            const actualPackages = packageHelper.addPackagesVersionConstraint(inputPackages);
            expect(JSON.stringify(actualPackages)).to.equal(JSON.stringify(expectedPackages));
        });
    });
});

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
const stripAnsi = require('strip-ansi');

describe('package-helper', function() {
    const baseCwd = process.cwd();

    describe('recommended install command is based on the existing lock files', function() {
        after(function() {
            process.chdir(baseCwd);
        });

        it('missing packages without any lock file', function() {
            process.chdir(path.join(__dirname , '../fixtures/package-helper/empty'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('npm install foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with package-lock.json only', function() {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('npm install foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with yarn.lock only', function() {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with pnpm-lock.yaml only', function() {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/pnpm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('pnpm add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with both package-lock.json and yarn.lock', function() {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn-npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with package-lock.json, yarn.lock and pnpm-lock.yaml', function() {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/pnpm-yarn-npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' }
            ]);
            expect(packageRecommendations.installCommand).to.contain('pnpm add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with alternative packages', function() {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' },
                [{ name: 'bar' }, { name: 'baz' }],
                [{ name: 'qux' }, { name: 'corge' }, { name: 'grault' }],
                [{ name: 'quux' }, { name: 'webpack' }],
            ]);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar qux');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar (or baz) & qux (or corge or grault)');
        });
    });

    describe('check messaging on install commands', function() {
        it('Make sure the major version is included in the install command', function() {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'bar', version: '^3.0' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar@^3.0');
        });

        it('Recommends correct install on 0 version', function() {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^0.1.0' },
                { name: 'bar' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo@^0.1.0 bar');
        });

        it('Recommends correct install with a more complex constraint', function() {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0||^8.0' },
                { name: 'bar' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo@^8.0 bar');
        });

        it('Recommends correct install with a more complex constraint (spaces around ||)', function() {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0 || ^8.0' },
                { name: 'bar' }
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo@^8.0 bar');
        });

        it('Recommends correct install with alternative packages', function() {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0 || ^8.0' },
                [{ name: 'bar' }, { name: 'baz' }],
                [{ name: 'qux', version: '^1.0' }, { name: 'quux', version: '^2.0' }]
            ]);

            expect(packageRecommendations.installCommand).to.contain('yarn add foo@^8.0 bar qux@^1.0');
        });
    });

    describe('The getInvalidPackageVersionRecommendations correctly checks installed versions', function() {
        it('Check package that *is* the correct version', function() {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: '@hotwired/stimulus', version: '^3.0.0' },
                { name: 'preact', version: '^8.2.0 || ^10.0.0' }
            ]);

            expect(versionProblems).to.be.empty;
        });

        it('Check package with a version too low', function() {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: '@hotwired/stimulus', version: '^4.0.0' },
                { name: 'preact', version: '9.0.0' }
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too old');
        });

        it('Check package with a version too new', function() {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: '@hotwired/stimulus', version: '^2.0' },
                { name: 'preact', version: '8.1.0' }
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too new');
        });

        it('Missing "version" key is ok', function() {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: '^6.9.9' },
                { name: 'preact' }
            ]);

            // just sass-loader
            expect(versionProblems).to.have.length(1);
        });

        it('Beta version is ok', function() {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'vue', version: '^3.0.0-beta.5' },
            ]);

            expect(versionProblems).to.be.empty;
        });
    });

    describe('addPackagesVersionConstraint', function() {
        it('Lookup a version constraint', function() {
            const inputPackages = [
                { name: 'sass-loader', enforce_version: 7 },
                { name: 'node-sass' },
                { name: 'vue', version: '^2' }
            ];

            const packageInfo = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../package.json'))
            );

            const expectedPackages = [
                { name: 'sass-loader', version: packageInfo.devDependencies['sass-loader'] },
                { name: 'node-sass' },
                { name: 'vue', version: '^2' }
            ];

            const actualPackages = packageHelper.addPackagesVersionConstraint(inputPackages);
            expect(JSON.stringify(actualPackages)).to.equal(JSON.stringify(expectedPackages));
        });
    });
});

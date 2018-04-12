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
            const packageRecommendations = packageHelper.getPackageRecommendations(['foo', 'webpack', 'bar']);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
        });

        it('missing packages with package-lock.json only', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/npm'));
            const packageRecommendations = packageHelper.getPackageRecommendations(['foo', 'webpack', 'bar']);
            expect(packageRecommendations.installCommand).to.contain('npm install foo bar');
        });

        it('missing packages with yarn.lock only', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn'));
            const packageRecommendations = packageHelper.getPackageRecommendations(['foo', 'webpack', 'bar']);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
        });

        it('missing packages with both package-lock.json and yarn.lock', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn-npm'));
            const packageRecommendations = packageHelper.getPackageRecommendations(['foo', 'webpack', 'bar']);
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
        });
    });
});

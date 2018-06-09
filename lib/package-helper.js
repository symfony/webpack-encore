/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chalk = require('chalk');
const fs = require('fs');

function ensurePackagesExist(packagesConfig, requestedFeature) {
    const recommendation = getMissingPackageRecommendations(packagesConfig, requestedFeature);

    if (!recommendation) {
        return;
    }

    throw new Error(`
${recommendation.message}
  ${recommendation.installCommand}
`);
}

function getInstallCommand(packages) {
    const hasYarnLockfile = fs.existsSync('yarn.lock');
    const hasNpmLockfile = fs.existsSync('package-lock.json');

    if (hasNpmLockfile && !hasYarnLockfile) {
        return chalk.yellow(`npm install ${packages.join(' ')} --save-dev`);
    }

    return chalk.yellow(`yarn add ${packages.join(' ')} --dev`);
}

function getMissingPackageRecommendations(packagesConfig, requestedFeature = null) {
    let missingPackageNames = [];

    for (let packageConfig of packagesConfig) {
        try {
            require.resolve(packageConfig.name);
        } catch (e) {
            missingPackageNames.push(packageConfig.name);
        }
    }

    if (missingPackageNames.length === 0) {
        return;
    }

    const missingPackageNamesChalked = missingPackageNames.map(function(packageName) {
        return chalk.green(packageName);
    });

    let message = `Install ${missingPackageNamesChalked.join(' & ')}`;
    if (requestedFeature) {
        message += ` to use ${chalk.green(requestedFeature)}`;
    }

    const installCommand = getInstallCommand(missingPackageNames);

    return {
        message,
        installCommand
    };
}

module.exports = {
    ensurePackagesExist,
    getMissingPackageRecommendations
};

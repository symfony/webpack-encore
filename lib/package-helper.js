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
const logger = require('./logger');

function ensurePackagesExist(packagesConfig, requestedFeature) {
    const missingPackagesRecommendation = getMissingPackageRecommendations(packagesConfig, requestedFeature);

    if (!missingPackagesRecommendation) {
        throw new Error(`
${missingPackagesRecommendation.message}
  ${missingPackagesRecommendation.installCommand}
`
        );
    }

    // check for invalid versions & warn
    const invalidVersionRecommendations = getInvalidPackageVersionRecommendations(packagesConfig, requestedFeature);
    for (let message of invalidVersionRecommendations) {
        logger.warning(message);
    }
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

function getInvalidPackageVersionRecommendations(packagesConfig, requestedFeature) {
    let badVersionMessages = [];

    for (let packageConfig of packagesConfig) {
        if (typeof packageConfig.version === 'undefined') {
            continue;
        }

        let version;
        try {
            version = /^(\d+)/.exec(require(`${packageConfig.name}/package.json`).version).pop();
        } catch (e) {
            // should not happen because this functions is meant to be
            // called only after verifying a package is actually installed
            throw new Error(`Could not find package.json file for ${packageConfig.name}`);
        }

        if (Number(version) < packageConfig.version) {
            badVersionMessages.push(
                `Webpack Encore requires version ${chalk.green(packageConfig.version)} of ${chalk.green(packageConfig.name)}, but your version (${chalk.green(version)}) is too old. The related feature will probably *not* work correctly.`
            );
        } else if (Number(version) > packageConfig.version) {
            badVersionMessages.push(
                `Webpack Encore requires version ${chalk.green(packageConfig.version)} of ${chalk.green(packageConfig.name)}. Your version ${chalk.green(version)} is too new. The related feature *may* still work properly. If you have issues, try downgrading the library, or upgrading Encore.`
            );
        }
    }

    return badVersionMessages;
}

module.exports = {
    ensurePackagesExist,
    getMissingPackageRecommendations,
    getInvalidPackageVersionRecommendations
};

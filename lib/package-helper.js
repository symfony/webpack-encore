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
const semver = require('semver');

function ensurePackagesExist(packagesConfig, requestedFeature) {
    const missingPackagesRecommendation = getMissingPackageRecommendations(packagesConfig, requestedFeature);

    if (missingPackagesRecommendation) {
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

function getInstallCommand(packageConfigs) {
    const hasYarnLockfile = fs.existsSync('yarn.lock');
    const hasNpmLockfile = fs.existsSync('package-lock.json');
    const packageInstallStrings = packageConfigs.map((packageConfig) => {
        if (typeof packageConfig.version === 'undefined') {
            return packageConfig.name;
        }

        // e.g. ^4.0||^5.0: use the latest version
        let recommendedVersion = packageConfig.version;
        if (recommendedVersion.indexOf('||') !== -1) {
            recommendedVersion = recommendedVersion.split('|').pop().trim();
        }

        // recommend the version included in our package.json file
        return `${packageConfig.name}@${recommendedVersion}`;
    });

    if (hasNpmLockfile && !hasYarnLockfile) {
        return chalk.yellow(`npm install ${packageInstallStrings.join(' ')} --save-dev`);
    }

    return chalk.yellow(`yarn add ${packageInstallStrings.join(' ')} --dev`);
}

function getMissingPackageRecommendations(packagesConfig, requestedFeature = null) {
    let missingPackageConfigs = [];

    for (let packageConfig of packagesConfig) {
        try {
            require.resolve(packageConfig.name);
        } catch (e) {
            missingPackageConfigs.push(packageConfig);
        }
    }

    if (missingPackageConfigs.length === 0) {
        return;
    }

    const missingPackageNamesChalked = missingPackageConfigs.map(function(packageConfig) {
        return chalk.green(packageConfig.name);
    });

    let message = `Install ${missingPackageNamesChalked.join(' & ')}`;
    if (requestedFeature) {
        message += ` to use ${chalk.green(requestedFeature)}`;
    }

    const installCommand = getInstallCommand(missingPackageConfigs);

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
            version = require(`${packageConfig.name}/package.json`).version;
        } catch (e) {
            // should not happen because this functions is meant to be
            // called only after verifying a package is actually installed
            throw new Error(`Could not find package.json file for ${packageConfig.name}`);
        }

        if (semver.satisfies(version, packageConfig.version)) {
            continue;
        }

        if (semver.gtr(version, packageConfig.version)) {
            badVersionMessages.push(
                `Webpack Encore requires version ${chalk.green(packageConfig.version)} of ${chalk.green(packageConfig.name)}. Your version ${chalk.green(version)} is too new. The related feature *may* still work properly. If you have issues, try downgrading the library, or upgrading Encore.`
            );
        } else {
            badVersionMessages.push(
                `Webpack Encore requires version ${chalk.green(packageConfig.version)} of ${chalk.green(packageConfig.name)}, but your version (${chalk.green(version)}) is too old. The related feature will probably *not* work correctly.`
            );
        }
    }

    return badVersionMessages;
}

function addPackagesVersionConstraint(packages) {
    const packageJsonData = require('../package.json');

    return packages.map(packageData => {
        const newData = Object.assign({}, packageData);

        if (packageData.enforce_version) {
            // this method only supports devDependencies due to how it's used:
            // it's mean to inform the user what deps they need to install
            // for optional features
            if (!packageJsonData.devDependencies[packageData.name]) {
                throw new Error(`Count not find package ${packageData.name}`);
            }

            newData.version = packageJsonData.devDependencies[packageData.name];
            delete newData['enforce_version'];
        }

        return newData;
    });
}

module.exports = {
    ensurePackagesExist,
    getMissingPackageRecommendations,
    getInvalidPackageVersionRecommendations,
    addPackagesVersionConstraint,
};

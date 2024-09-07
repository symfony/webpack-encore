/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const pc = require('picocolors');
const fs = require('fs');
const logger = require('./logger');
const semver = require('semver');

function ensurePackagesExist(packagesConfig, requestedFeature) {
    const missingPackagesRecommendation = getMissingPackageRecommendations(packagesConfig, requestedFeature);

    if (missingPackagesRecommendation) {
        throw `
${missingPackagesRecommendation.message}
  ${missingPackagesRecommendation.installCommand}
`;
    }

    // check for invalid versions & warn
    const invalidVersionRecommendations = getInvalidPackageVersionRecommendations(packagesConfig);
    for (let message of invalidVersionRecommendations) {
        logger.warning(message);
    }
}

function getInstallCommand(packageConfigs) {
    const hasPnpmLockfile = fs.existsSync('pnpm-lock.yaml');
    const hasYarnLockfile = fs.existsSync('yarn.lock');
    const packageInstallStrings = packageConfigs.map((packageConfig) => {
        const firstPackage = packageConfig[0];

        if (typeof firstPackage.version === 'undefined') {
            return firstPackage.name;
        }

        // e.g. ^4.0||^5.0: use the latest version
        let recommendedVersion = firstPackage.version;
        if (recommendedVersion.includes('||')) {
            recommendedVersion = recommendedVersion.split('|').pop().trim();
        }

        // recommend the version included in our package.json file
        return `${firstPackage.name}@${recommendedVersion}`;
    });

    if (hasPnpmLockfile) {
        return pc.yellow(`pnpm add ${packageInstallStrings.join(' ')} --save-dev`);
    }

    if (hasYarnLockfile) {
        return pc.yellow(`yarn add ${packageInstallStrings.join(' ')} --dev`);
    }

    return pc.yellow(`npm install ${packageInstallStrings.join(' ')} --save-dev`);
}

function isPackageInstalled(packageConfig) {
    try {
        require.resolve(packageConfig.name);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 *
 * @param {string} packageName
 * @returns {null|string}
 */
function getPackageVersion(packageName) {
    try {
        return require(`${packageName}/package.json`).version;
    } catch (e) {
        return null;
    }
}

function getMissingPackageRecommendations(packagesConfig, requestedFeature = null) {
    let missingPackageConfigs = [];

    for (let packageConfig of packagesConfig) {
        if (!Array.isArray(packageConfig)) {
            packageConfig = [packageConfig];
        }

        if (!packageConfig.some(isPackageInstalled)) {
            missingPackageConfigs.push(packageConfig);
        }
    }

    if (missingPackageConfigs.length === 0) {
        return;
    }

    const missingPackageNamesPicocolorsed = missingPackageConfigs.map(function(packageConfigs) {
        const packageNames = packageConfigs.map(packageConfig => {
            return pc.green(packageConfig.name);
        });

        let missingPackages = packageNames[0];
        if (packageNames.length > 1) {
            const alternativePackages = packageNames.slice(1);
            missingPackages = `${missingPackages} (or ${alternativePackages.join(' or ')})`;
        }

        return missingPackages;
    });

    let message = `Install ${missingPackageNamesPicocolorsed.join(' & ')}`;
    if (requestedFeature) {
        message += ` to use ${pc.green(requestedFeature)}`;
    }

    const installCommand = getInstallCommand(missingPackageConfigs);

    return {
        message,
        installCommand
    };
}

function getInvalidPackageVersionRecommendations(packagesConfig) {
    const processPackagesConfig = (packageConfig) => {
        if (Array.isArray(packageConfig)) {
            let messages = [];

            for (const config of packageConfig) {
                messages = messages.concat(processPackagesConfig(config));
            }

            return messages;
        }

        if (typeof packageConfig.version === 'undefined') {
            return [];
        }

        const version = getPackageVersion(packageConfig.name);

        // If version is null at this point it should be because
        // of an optional dependency whose presence has already
        // been checked before.
        if (version === null) {
            return [];
        }

        if (semver.satisfies(version, packageConfig.version)) {
            return [];
        }

        if (semver.gtr(version, packageConfig.version)) {
            return [
                `Webpack Encore requires version ${pc.green(packageConfig.version)} of ${pc.green(packageConfig.name)}. Your version ${pc.green(version)} is too new. The related feature *may* still work properly. If you have issues, try downgrading the library, or upgrading Encore.`
            ];
        } else {
            return [
                `Webpack Encore requires version ${pc.green(packageConfig.version)} of ${pc.green(packageConfig.name)}, but your version (${pc.green(version)}) is too old. The related feature will probably *not* work correctly.`
            ];
        }
    };

    return processPackagesConfig(packagesConfig);
}

function addPackagesVersionConstraint(packages) {
    const packageJsonData = require('../package.json');
    const addConstraint = (packageData) => {
        if (Array.isArray(packageData)) {
            return packageData.map(addConstraint);
        }

        const newData = Object.assign({}, packageData);

        if (packageData.enforce_version) {
            if (!packageJsonData.devDependencies) {
                logger.warning('Could not find devDependencies key on @symfony/webpack-encore package');

                return newData;
            }

            // this method only supports devDependencies due to how it's used:
            // it's mean to inform the user what deps they need to install
            // for optional features
            if (!packageJsonData.devDependencies[packageData.name]) {
                throw new Error(`Could not find package ${packageData.name}`);
            }

            newData.version = packageJsonData.devDependencies[packageData.name];
            delete newData['enforce_version'];
        }

        return newData;
    };


    return packages.map(addConstraint);
}

module.exports = {
    ensurePackagesExist,
    getMissingPackageRecommendations,
    getInvalidPackageVersionRecommendations,
    addPackagesVersionConstraint,
    getInstallCommand,
    getPackageVersion,
};

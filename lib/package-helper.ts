/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs';
import { createRequire } from 'module';

import pc from 'picocolors';
import semver from 'semver';

import packageJson from '../package.json' with { type: 'json' };
import logger from './logger.ts';

// `createRequire` is still needed for the dynamic `require('<pkg>/package.json')`
// lookups in getPackageVersion() (arbitrary installed packages, not a static import).
const require = createRequire(import.meta.url);

export interface PackageConfig {
    name: string;
    version?: string;
    enforce_version?: boolean;
}

/**
 * A list of package configs, where each entry is either a single package or a
 * group of interchangeable alternatives (e.g. sass / sass-embedded / node-sass).
 */
export type PackagesConfig = Array<PackageConfig | PackageConfig[]>;

/** A single package or an arbitrarily-nested list of them (used for recursion). */
type NestedPackagesConfig = PackageConfig | NestedPackagesConfig[];

export interface PackageRecommendation {
    message: string;
    installCommand: string;
}

function ensurePackagesExist(packagesConfig: PackagesConfig, requestedFeature: string): void {
    const missingPackagesRecommendation = getMissingPackageRecommendations(
        packagesConfig,
        requestedFeature
    );

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

function getInstallCommand(packageConfigs: PackageConfig[][]): string {
    const hasPnpmLockfile = fs.existsSync('pnpm-lock.yaml');
    const hasYarnLockfile = fs.existsSync('yarn.lock');
    const packageInstallStrings = packageConfigs.map((packageConfig) => {
        const firstPackage = packageConfig[0]!;

        if (typeof firstPackage.version === 'undefined') {
            return firstPackage.name;
        }

        // e.g. ^4.0||^5.0: use the latest version
        let recommendedVersion = firstPackage.version;
        if (recommendedVersion.includes('||')) {
            recommendedVersion = recommendedVersion.split('|').pop()!.trim();
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

function isPackageInstalled(packageConfig: PackageConfig): boolean {
    try {
        import.meta.resolve(packageConfig.name);
        return true;
    } catch {
        return false;
    }
}

function getPackageVersion(packageName: string): string | null {
    try {
        return (require(`${packageName}/package.json`) as { version: string }).version;
    } catch {
        return null;
    }
}

function getMissingPackageRecommendations(
    packagesConfig: PackagesConfig,
    requestedFeature: string | null = null
): PackageRecommendation | undefined {
    const missingPackageConfigs: PackageConfig[][] = [];

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

    const missingPackageNamesPicocolorsed = missingPackageConfigs.map(function (packageConfigs) {
        const packageNames = packageConfigs.map((packageConfig) => {
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
        installCommand,
    };
}

function getInvalidPackageVersionRecommendations(packagesConfig: PackagesConfig): string[] {
    const processPackagesConfig = (packageConfig: NestedPackagesConfig): string[] => {
        if (Array.isArray(packageConfig)) {
            let messages: string[] = [];

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
                `Webpack Encore requires version ${pc.green(packageConfig.version)} of ${pc.green(packageConfig.name)}. Your version ${pc.green(version)} is too new. The related feature *may* still work properly. If you have issues, try downgrading the library, or upgrading Encore.`,
            ];
        } else {
            return [
                `Webpack Encore requires version ${pc.green(packageConfig.version)} of ${pc.green(packageConfig.name)}, but your version (${pc.green(version)}) is too old. The related feature will probably *not* work correctly.`,
            ];
        }
    };

    return processPackagesConfig(packagesConfig);
}

function addPackagesVersionConstraint(packages: PackagesConfig): PackagesConfig {
    // packageJson.peerDependencies is inferred with literal keys; widen it to a
    // string->version map so it can be looked up by an arbitrary package name.
    const peerDependencies: Record<string, string> = packageJson.peerDependencies;
    const addConstraint = (packageData: PackageConfig): PackageConfig => {
        const newData = Object.assign({}, packageData);

        if (packageData.enforce_version) {
            if (!peerDependencies) {
                logger.warning(
                    'Could not find peerDependencies key on @symfony/webpack-encore package'
                );

                return newData;
            }

            // this method only supports peerDependencies due to how it's used:
            // it's mean to inform the user what deps they need to install
            // for optional features
            if (!peerDependencies[packageData.name]) {
                throw new Error(
                    `Could not find package ${packageData.name} in peerDependencies of @symfony/webpack-encore`
                );
            }

            newData.version = peerDependencies[packageData.name];
            delete newData['enforce_version'];
        }

        return newData;
    };
    return packages.map((packageData) =>
        Array.isArray(packageData) ? packageData.map(addConstraint) : addConstraint(packageData)
    );
}

export default {
    ensurePackagesExist,
    getMissingPackageRecommendations,
    getInvalidPackageVersionRecommendations,
    addPackagesVersionConstraint,
    getInstallCommand,
    getPackageVersion,
};

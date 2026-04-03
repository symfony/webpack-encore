/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs/promises';
import childProcess from 'child_process';

/**
 * @param {string} dependency
 * @param {string} range
 * @return {Promise<[string, string]>}
 */
function getLowestVersion(dependency, range) {
    return new Promise((resolve, reject) => {
        if (range.startsWith('file:')) {
            resolve([dependency, range]);
            return;
        }

        childProcess.exec(
            `npm view "${dependency}@${range}" version`,
            { encoding: 'utf-8' },
            (error, stdout) => {
                if (error) {
                    reject(`Could not retrieve versions list for "${dependency}@${range}"`);
                    return;
                }

                const versions = stdout
                    .split('\n')
                    .filter(line => line);

                if (versions.length === 0) {
                    reject(`Could not find a lowest version for "${dependency}@${range}"`);
                    return;
                }

                const parts = versions[0].split(' ');

                // If there is only one version available that version
                // is directly printed as the output of npm view.
                if (parts.length === 1) {
                    resolve([dependency, parts[0]]);
                    return;
                }

                // If multiple versions are available then it outputs
                // multiple lines matching the following format:
                // <package>@<version> '<version>'
                if (parts.length === 2) {
                    resolve([dependency, parts[1].replace(/'/g, '')]);
                    return;
                }

                reject(`Unexpected response for "${dependency}@${range}": ${versions[0]}`);
            }
        );
    });
}

const data = await fs.readFile('package.json', 'utf-8');
const packageInfo = JSON.parse(data);

const dependencyPromises = [];
if (packageInfo.dependencies) {
    for (const dependency in packageInfo.dependencies) {
        dependencyPromises.push(getLowestVersion(
            dependency,
            packageInfo.dependencies[dependency]
        ));
    }
}

const devDependencyPromises = [];
if (packageInfo.devDependencies) {
    for (const devDependency in packageInfo.devDependencies) {
        devDependencyPromises.push(getLowestVersion(
            devDependency,
            packageInfo.devDependencies[devDependency]
        ));
    }
}

const [dependencyVersions, devDependencyVersions] = await Promise.all([
    Promise.all(dependencyPromises),
    Promise.all(devDependencyPromises),
]);

for (const [name, version] of dependencyVersions) {
    packageInfo.dependencies[name] = version;
}

for (const [name, version] of devDependencyVersions) {
    packageInfo.devDependencies[name] = version;
}

await fs.writeFile('package.json', JSON.stringify(packageInfo, null, 2));

console.log('Updated package.json file with lowest dependency versions: ');

console.log('Dependencies:');
for (const dependency in packageInfo.dependencies) {
    console.log(`  - ${dependency}: ${packageInfo.dependencies[dependency]}`);
}

console.log('Dev dependencies:');
for (const dependency in packageInfo.devDependencies) {
    console.log(`  - ${dependency}: ${packageInfo.devDependencies[dependency]}`);
}

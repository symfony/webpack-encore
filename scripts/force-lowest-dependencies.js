/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const childProcess = require('child_process');

function getLowestVersion(dependency, range) {
    return new Promise((resolve, reject) => {
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

fs.readFile('package.json', (error, data) => {
    if (error) {
        throw error;
    }

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

    const dependenciesUpdate = Promise.all(dependencyPromises).then(versions => {
        versions.forEach(version => {
            packageInfo.dependencies[version[0]] = version[1];
        });
    });

    const devDependenciesUpdate = Promise.all(devDependencyPromises).then(versions => {
        versions.forEach(version => {
            packageInfo.devDependencies[version[0]] = version[1];
        });
    });

    // Once all the lowest versions have been resolved, update the
    // package.json file accordingly.
    Promise
        .all([dependenciesUpdate, devDependenciesUpdate])
        .then(() => new Promise((resolve, reject) => {
            fs.writeFile('package.json', JSON.stringify(packageInfo, null, 2), (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        }))
        .then(() => {
            console.log('Updated package.json file with lowest dependency versions: ');

            console.log('Dependencies:');
            for (const dependency in packageInfo.dependencies) {
                console.log(`  - ${dependency}: ${packageInfo.dependencies[dependency]}`);
            }

            console.log('Dev dependencies:');
            for (const dependency in packageInfo.devDependencies) {
                console.log(`  - ${dependency}: ${packageInfo.devDependencies[dependency]}`);
            }
        })
        .catch(error => {
            console.error(error);
            process.exit(1); // eslint-disable-line
        });
});

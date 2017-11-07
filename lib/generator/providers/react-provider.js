/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');
const tmp = require('tmp');
const extract = require('extract-zip');

const repositoryZipUrl = 'https://codeload.github.com/facebookincubator/create-react-app/zip/master';

function downloadReactPackage(path) {
    console.log(`Downloading React package from ${repositoryZipUrl} to ${path}`);
    return new Promise((resolve, reject) => {
        const reactPackage = fs.createWriteStream(path);
        https.get(repositoryZipUrl, (response) => {
            response.pipe(reactPackage);
            reactPackage.on('finish', () => {
                reactPackage.close(() => {
                    resolve();
                });
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function extractReactPackage(source, dest) {
    console.log(`Extracting React package from ${source} to ${dest}`);
    return new Promise((resolve, reject) => {
        extract(source, { dir: dest }, (err) => {
            return err ? reject(err) : resolve();
        });
    });
}

function moveFiles(source, initConfig) {
    console.log(`Moving files from ${source}`);
    return new Promise((resolve, reject) => {
        const templatePath = path.join(source, 'create-react-app-master/packages/react-scripts/template');

        // TODO Copy files to the right directory
        fs.readdir(templatePath, (err, files) => {
            if (err) {
                return reject(err);
            }

            console.log('Template files:');
            files.forEach(file => {
                console.log(`  - ${file}`);
            });
        });
    });
}

module.exports = function(initConfig) {
    return new Promise((resolve, reject) => {
        console.log('Creating a default React app');

        // Download
        tmp.dir({ unsafeCleanup: true }, (err, tmpPath, cleanup) => {
            if (err) {
                return reject(err);
            }

            const packagePath = path.join(tmpPath, 'react.zip');
            const extractPath = path.join(tmpPath, 'react');

            downloadReactPackage(packagePath)
                .then(() => extractReactPackage(packagePath, extractPath))
                .then(() => moveFiles(extractPath, initConfig))
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    });
};

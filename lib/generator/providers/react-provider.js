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
const https = require('https');
const path = require('path');
const tmp = require('tmp');
const extract = require('extract-zip');
const ncp = require('ncp');
const inquirer = require('inquirer');
const features = require('../../features');

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

function moveFiles(source, destination) {
    return new Promise((resolve, reject) => {
        const templateSrcPath = path.join(source, 'create-react-app-master/packages/react-scripts/template/src');

        let copyFiles = true;
        if (fs.existsSync(destination)) {
            inquirer.prompt({
                type: 'confirm',
                name: 'overwrite',
                message: `The path "${destination}" already exists, do you want to overwrite it?`,
                default: false
            }).then((answers) => {
                copyFiles = answers.overwrite;
            });
        }

        if (!copyFiles) {
            resolve();

            return;
        }

        ncp(templateSrcPath, destination, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
}

/**
 * Replaces some text in the generated files
 *
 * @param {string} entryDirPath
 * @param {InitConfig} initConfig
 * @return {Promise<any>}
 */
function updateText(entryDirPath, initConfig) {
    return new Promise((resolve, reject) => {
        const targetFile = path.join(entryDirPath, 'App.js');

        // make the path to the file a bit more accurate
        const contents = fs.readFileSync(targetFile, 'utf8');
        const updatedContents = contents.replace('src/App.js', entryDirPath+'/App.js')
        fs.writeFileSync(targetFile, updatedContents);

        resolve();
    });
}

/**
 * @param {InitConfig} initConfig
 * @return {string}
 */
const getTargetDirectory = function(initConfig) {
    return path.join(initConfig.projectPath, initConfig.assetRelativeDir, initConfig.entryName);
};

module.exports = {
    /**
     * @param {InitConfig} initConfig
     * @return {string}
     */
    getEntryPath: function(initConfig) {
        // the react template app has an "index.js" entry
        return path.join(getTargetDirectory(initConfig), 'index.js');
    },

    getEncoreActivationMethod: function(initConfig) {
        return 'enableReactPreset()';
    },

    getDependencies: function(initConfig) {
        return features.getFeatureConfig('react').packages;
    },

    /**
     * @param {InitConfig} initConfig
     * @return {Promise<any>}
     */
    build: function(initConfig) {
        return new Promise((resolve, reject) => {
            console.log('Creating a default React app');

            // Download
            tmp.dir({ unsafeCleanup: true }, (err, tmpPath, cleanup) => {
                if (err) {
                    return reject(err);
                }

                const packagePath = path.join(tmpPath, 'react.zip');
                const extractPath = path.join(tmpPath, 'react');
                const targetDirectory = getTargetDirectory(initConfig);

                downloadReactPackage(packagePath)
                    .then(() => extractReactPackage(packagePath, extractPath))
                    .then(() => moveFiles(extractPath, targetDirectory))
                    .then(() => updateText(targetDirectory, initConfig))
                    .then(() => resolve())
                    .catch((err) => reject(err))
                ;
            });
        });
    }
};

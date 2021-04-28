/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const regexEscaper = require('../../lib/utils/regexp-escaper');

const loadManifest = function(webpackConfig) {
    return JSON.parse(
        fs.readFileSync(path.join(webpackConfig.outputPath, 'manifest.json'), 'utf8')
    );
};

const readOutputFile = function(webpackConfig, filePath) {
    const fullPath = path.join(webpackConfig.outputPath, filePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Output file "${filePath}" does not exist.`);
    }

    return fs.readFileSync(fullPath, 'utf8');
};

const getMatchedFilename = function(targetDirectory, filenameRegex) {
    const actualFiles = fs.readdirSync(targetDirectory);
    let foundFile = false;
    actualFiles.forEach((actualFile) => {
        // filter out directories
        if (fs.statSync(path.join(targetDirectory, actualFile)).isDirectory()) {
            return;
        }

        if (actualFile.match(filenameRegex)) {
            foundFile = actualFile;
        }
    });

    return foundFile;
};

/**
 * Returns a regex to use to match this filename
 *
 * @param {string} filename Filename with possible [hash:8] wildcard
 * @return {RegExp}
 */
const convertFilenameToMatcher = function(filename) {
    const hashMatch = filename.match(/\[hash:(\d+)\]/);

    if (hashMatch === null) {
        return new RegExp(regexEscaper(filename));
    }

    const [hashString, hashLength] = hashMatch;

    return new RegExp(
        regexEscaper(filename)
            .replace(regexEscaper(hashString), `([a-z0-9_-]){${hashLength}}`)
    );
};

class Assert {
    /**
     * @param {WebpackConfig} webpackConfig
     */
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    assertOutputFileContains(filePath, expectedContents) {
        const actualFilename = getMatchedFilename(
            this.webpackConfig.outputPath,
            convertFilenameToMatcher(filePath)
        );

        if (false === actualFilename) {
            throw new Error(`Output file "${filePath}" does not exist.`);
        }

        const fullPath = path.join(this.webpackConfig.outputPath, actualFilename);

        const actualContents = fs.readFileSync(fullPath, 'utf8');
        if (!actualContents.includes(expectedContents)) {
            throw new Error(`Expected contents "${expectedContents}" not found in file ${fullPath}`);
        }
    }

    assertOutputFileDoesNotExist(filePath) {
        const fullPath = path.join(this.webpackConfig.outputPath, filePath);

        if (fs.existsSync(fullPath)) {
            throw new Error(`Output file "${filePath}" exist but should not!`);
        }
    }

    assertOutputFileDoesNotContain(filePath, expectedContents) {
        const fullPath = path.join(this.webpackConfig.outputPath, filePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Output file "${filePath}" does not exist.`);
        }

        const actualContents = fs.readFileSync(fullPath, 'utf8');
        if (actualContents.includes(expectedContents)) {
            throw new Error(`Contents "${expectedContents}" *were* found in file ${fullPath}, but should not have been.`);
        }
    }

    assertOutputFileHasSourcemap(filePath) {
        const actualContents = readOutputFile(this.webpackConfig, filePath);

        const hasSourceMappingUrl = actualContents.includes('sourceMappingURL');
        const hasSourceUrl = actualContents.includes('sourceURL');

        if (!hasSourceMappingUrl && !hasSourceUrl) {
            throw new Error(`No sourcemap found for ${filePath}!`);
        }

        if (hasSourceMappingUrl) {
            const sourceMappingUrlContents = actualContents.split('sourceMappingURL')[1];

            // if you set config.devtool = '#inline-source-map', but then
            // incorrectly configure css/sass sourcemaps, you WILL have
            // a sourcemap, but it will be too small / i.e. basically empty
            if (sourceMappingUrlContents.length < 200) {
                throw new Error(`Sourcemap for ${filePath} appears to be empty!`);
            }
        }
    }

    assertOutputFileDoesNotHaveSourcemap(filePath) {
        const actualContents = readOutputFile(this.webpackConfig, filePath);

        if (actualContents.includes('sourceMappingURL') || actualContents.includes('sourceURL')) {
            throw new Error(`Sourcemap found for ${filePath}!`);
        }
    }

    assertManifestPath(sourcePath, expectedDestinationPath) {
        const manifestData = loadManifest(this.webpackConfig);

        this.assertManifestKeyExists(sourcePath);

        const expectedRegex = convertFilenameToMatcher(expectedDestinationPath);

        if (!manifestData[sourcePath].match(expectedRegex)) {
            throw new Error(`source path ${sourcePath} expected to match pattern ${expectedDestinationPath}, was actually ${manifestData[sourcePath]}`);
        }
    }

    assertManifestKeyExists(key) {
        const manifestData = loadManifest(this.webpackConfig);

        if (!manifestData[key]) {
            throw new Error(`No ${key} key found in manifest ${JSON.stringify(manifestData)}`);
        }
    }

    assertManifestPathDoesNotExist(sourcePath) {
        const manifestData = loadManifest(this.webpackConfig);

        if (manifestData[sourcePath]) {
            throw new Error(`Source ${sourcePath} key WAS found in manifest, but should not be there!`);
        }
    }

    /**
     *
     * @param {Browser} browser
     * @param {Array}   expectedResourcePaths Array of expected resources, but just
     *                  their short filenames - e.g. main.css
     *                  (i.e. without the public path)
     * @return {void}
     */
    assertResourcesLoadedCorrectly(browser, expectedResourcePaths) {
        const actualResources = [];
        for (let resource of browser.resources) {
            // skip the .html page as a resource
            if (resource.request.url.includes('testing.html')) {
                continue;
            }

            actualResources.push(resource.request.url);
        }

        // prefix each expected resource with its public path
        // needed when the public path is a CDN
        const expectedResources = expectedResourcePaths.map((path) => {
            // if we've explicitly passed a full URL in for testing, ignore that
            if (path.startsWith('http://')) {
                return path;
            }

            return this.webpackConfig.getRealPublicPath() + path;
        });

        expect(actualResources).to.have.all.members(expectedResources);
    }

    assertOutputJsonFileMatches(sourcePath, expectedData) {
        const actualContents = readOutputFile(this.webpackConfig, sourcePath);

        const actualData = JSON.parse(actualContents);

        expect(JSON.stringify(actualData, null, 2)).to.equal(JSON.stringify(expectedData, null, 2));
    }

    /**
     * Verifies that the directory contains the array of files.
     *
     * The expectedFiles can contain a [hash:8] syntax in case
     * the file is versioned - e.g. main.[hash:8].js, which would
     * match a real file like main.abcd1234.js.
     *
     * @param {Array} expectedFiles
     * @param {string} directory relative to output to check
     * @returns {void}
     */
    assertDirectoryContents(expectedFiles, directory = '') {
        const targetDirectory = path.join(this.webpackConfig.outputPath, directory);

        expect(targetDirectory).to.be.a.directory();

        const expectedFileStrings = {};
        expectedFiles.forEach((expectedFile) => {
            expectedFileStrings[expectedFile] = convertFilenameToMatcher(expectedFile);
        });

        const actualFiles = fs.readdirSync(targetDirectory);
        actualFiles.forEach((foundFile) => {
            // filter out directories
            if (fs.statSync(path.join(targetDirectory, foundFile)).isDirectory()) {
                return;
            }

            let matchIsFound = false;

            for (const originalFilename of Object.keys(expectedFileStrings)) {
                const filenameRegex = expectedFileStrings[originalFilename];

                if (foundFile.match(filenameRegex)) {
                    matchIsFound = true;
                    delete expectedFileStrings[originalFilename];

                    break;
                }
            }

            if (!matchIsFound) {
                throw new Error(`File "${foundFile}" was found in directory but was not expected. Expected patterns where ${expectedFiles.join(', ')}`);
            }
        });

        if (Object.keys(expectedFileStrings).length > 0) {
            throw new Error(`Files ${Object.keys(expectedFileStrings).join(', ')} were expected to be found in the directory but were not. Actual files: ${actualFiles.join(', ')}`);
        }
    }

    /**
     * Return the contents of a built file.
     *
     * @param {string} filePath
     * @return {string}
     */
    readOutputFile(filePath) {
        return readOutputFile(this.webpackConfig, filePath);
    }
}

module.exports = function(webpackConfig) {
    return new Assert(webpackConfig);
};

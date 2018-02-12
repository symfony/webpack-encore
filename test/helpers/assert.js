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

class Assert {
    /**
     * @param {WebpackConfig} webpackConfig
     */
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    assertOutputFileContains(filePath, expectedContents) {
        const fullPath = path.join(this.webpackConfig.outputPath, filePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Output file "${filePath}" does not exist.`);
        }

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

        if (!actualContents.includes('sourceMappingURL')) {
            throw new Error(`No sourcemap found for ${filePath}!`);
        }

        const sourceMappingUrlContents = actualContents.split('sourceMappingURL')[1];

        // if you set config.devtool = '#inline-source-map', but then
        // incorrectly configure css/sass sourcemaps, you WILL have
        // a sourcemap, but it will be too small / i.e. basically empty
        if (sourceMappingUrlContents.length < 200) {
            throw new Error(`Sourcemap for ${filePath} appears to be empty!`);
        }
    }

    assertOutputFileDoesNotHaveSourcemap(filePath) {
        const actualContents = readOutputFile(this.webpackConfig, filePath);

        if (actualContents.includes('sourceMappingURL')) {
            throw new Error(`Sourcemap found for ${filePath}!`);
        }
    }

    assertManifestPath(sourcePath, expectedDestinationPath) {
        const manifestData = loadManifest(this.webpackConfig);

        if (!manifestData[sourcePath]) {
            throw new Error(`No ${sourcePath} key found in manifest ${JSON.stringify(manifestData)}`);
        }

        if (manifestData[sourcePath] !== expectedDestinationPath) {
            throw new Error(`source path ${sourcePath} expected to be set to ${expectedDestinationPath}, was actually ${manifestData[sourcePath]}`);
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
}

module.exports = function(webpackConfig) {
    return new Assert(webpackConfig);
};

const path = require('path');
const fs = require('fs');

class Assert
{
    /**
     * @param {WebpackConfig} webpackConfig
     */
    constructor(webpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    assertOutputFileContains(filePath, expectedContents) {
        const fullPath = path.join(this.webpackConfig.outputPath, filePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Output file "${fullPath}" does not exist.`);
        }

        const actualContents = fs.readFileSync(fullPath, 'utf8');
        if (!actualContents.includes(expectedContents)) {
            throw new Error(`Expected contents "${expectedContents}" not found in file ${fullPath}`);
        }
    }
}

module.exports = function(webpackConfig) {
    return new Assert(webpackConfig);
};

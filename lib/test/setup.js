const path = require('path');
const WebpackConfig = require('../WebpackConfig');
const fs = require('fs-extra');

const testDir = path.join(__dirname, '../', '../', 'test');
const testProjectDir = path.join(testDir, 'project');

function createWebpackConfig(outputDirName = '') {
    const config = new WebpackConfig(path.join(testDir, 'fixtures'));

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }

    const outputPath = path.join(testProjectDir, outputDirName);
    // allows us to create a few levels deep without issues
    fs.mkdirsSync(outputPath);
    config.setOutputPath(path.join(testProjectDir, outputDirName));

    return config;
}

function emptyTestDir() {
    fs.emptyDirSync(testProjectDir);
}

module.exports = {
    createWebpackConfig,
    emptyTestDir
};

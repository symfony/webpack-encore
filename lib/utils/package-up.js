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
const path = require('path');
const { fileURLToPath } = require('url');

/**
 * Inlined version of the package "package-up" (ESM only).
 *
 * @param {object} options
 * @param {string} options.cwd The directory to start searching from.
 * @returns {string|undefined} The path to the nearest package.json file or undefined if not found.
 */
module.exports = function({ cwd }) {
    return findUpSync('package.json', { cwd });
};

/**
 * @param {string|URL} urlOrPath
 * @returns {string}
 */
function toPath(urlOrPath) {
    return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
}

/**
 * Inlined and simplified version of the package "find-up-simple" (ESM only).
 *
 * @param {string} name The name of the file to find
 * @param {object} options
 * @param {string=} options.cwd The directory to start searching from.
 * @returns {string|undefined} The path to the file found or undefined if not found.
 */
function findUpSync(name, { cwd = process.cwd() } = {}) {
    let directory = path.resolve(toPath(cwd) || '');
    const { root } = path.parse(directory);

    while (directory && directory !== root) {
        const filePath = path.isAbsolute(name) ? name : path.join(directory, name);

        try {
            const stats = fs.statSync(filePath, { throwIfNoEntry: false });
            if (stats && stats.isFile()) {
                return filePath;
            }
        } catch (e) {}

        directory = path.dirname(directory);
    }
}

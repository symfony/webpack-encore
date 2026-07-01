/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Inlined version of the package "package-up" (ESM only).
 *
 * Returns the path to the nearest package.json file, or undefined if not found.
 */
export default function ({ cwd }: { cwd: string }): string | undefined {
    return findUpSync('package.json', { cwd });
}

function toPath(urlOrPath: string | URL): string {
    return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
}

/**
 * Inlined and simplified version of the package "find-up-simple" (ESM only).
 *
 * Returns the path to the file found, or undefined if not found.
 */
function findUpSync(
    name: string,
    { cwd = process.cwd() }: { cwd?: string } = {}
): string | undefined {
    let directory = path.resolve(toPath(cwd) || '');
    const { root } = path.parse(directory);

    while (directory && directory !== root) {
        const filePath = path.isAbsolute(name) ? name : path.join(directory, name);

        try {
            const stats = fs.statSync(filePath, { throwIfNoEntry: false });
            if (stats && stats.isFile()) {
                return filePath;
            }
        } catch {}

        directory = path.dirname(directory);
    }
}

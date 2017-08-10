/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const TYPE = 'loader-not-enabled';

function isMissingLoaderError(e) {
    if (e.name !== 'ModuleParseError') {
        return false;
    }

    if (e.message.indexOf('You may need an appropriate loader') === -1) {
        return false;
    }

    return true;
}

function getFileExtension(filename) {
    const str = filename.replace(/\?.*/, '');
    const split = str.split('.');

    return split.pop();
}

function transform(error) {
    if (!isMissingLoaderError(error)) {
        return error;
    }

    error = Object.assign({}, error);

    const extension = getFileExtension(error.file);
    switch (extension) {
        case 'sass':
        case 'scss':
            error.loaderName = 'sass';
            break;
        case 'less':
            error.loaderName = 'less';
            break;
        case 'jsx':
            error.loaderName = 'react';
            break;
        case 'tsx':
        case 'ts':
            error.loaderName = 'typescript';
            break;
        // add more as needed
        default:
            return error;
    }

    error.type = TYPE;
    error.severity = 900;
    error.name = 'Loader not enabled';

    return error;
}

module.exports = transform;

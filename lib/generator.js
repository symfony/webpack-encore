/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const inquirer = require('inquirer');

function runInit() {

}

module.exports = function(runtimeConfig) {
    switch (runtimeConfig.command) {
        case 'init':
            runInit();
            break;
        default:
            throw new Error(`Unknown generator command ${runtimeConfig.comma}.`);
    }
};

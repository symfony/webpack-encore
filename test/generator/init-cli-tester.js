/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const initQuestioner = require('../../lib/generator/init-questioner');
const fs = require('fs');
const inquirer = require('inquirer');

/**
 * Helper script used to test the init questions
 */
inquirer.prompt({
    type: 'input',
    message: 'tmp file name',
    name: 'tmpPath'
}).then(response => {
    initQuestioner().then(initConfig => {
        fs.writeFileSync(response.tmpPath, JSON.stringify(initConfig));
    });
});

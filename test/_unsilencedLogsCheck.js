/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const logger = require('../lib/logger');

beforeEach(function() {
    logger.quiet();
});

afterEach(function() {
    if (logger.getDeprecations().length > 0) {
        this.test.error(new Error(`There were ${logger.getWarnings().length} unexpected deprecation log messages: \n${logger.getDeprecations().join('\n')}`));
    }

    if (logger.getWarnings().length > 0) {
        this.test.error(new Error(`There were ${logger.getWarnings().length} unexpected warning log messages: \n${logger.getWarnings().join('\n')}`));
    }

    logger.reset();
});

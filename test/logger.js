/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';
import context from '../lib/context.js';
context.runtimeConfig = {};
import logger from '../lib/logger.js';

describe('logger', function() {
    beforeEach(function() {
        logger.reset();
    });

    afterEach(function() {
        logger.reset();
    });

    it('Smoke test for log methods', function() {

        const methods = [
            'debug',
            'recommendation',
            'warning',
            'deprecation',
        ];
        const testString = 'TEST MESSAGE';
        const expectedMessages = {
            debug: [testString],
            recommendation: [testString],
            warning: [testString],
            deprecation: [testString],
        };

        logger.quiet();
        logger.verbose();

        for (let loggerMethod of methods) {
            logger[loggerMethod](testString);
        }

        // clone the object so the afterEach doesn't clear out before
        // a failure message is shown
        const actualMessages = Object.assign({}, logger.getMessages());
        expect(actualMessages).toEqual(expectedMessages);
    });

    it('test reset()', function() {
        logger.debug('DEBUG!');
        logger.reset();

        const actualMessages = Object.assign({}, logger.getMessages());

        expect(actualMessages.debug).toHaveLength(0);
    });
});

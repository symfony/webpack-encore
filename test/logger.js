/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const expect = require('chai').expect;
require('../lib/context').runtimeConfig = {};
const logger = require('../lib/logger');

describe('logger', () => {
    beforeEach(() => {
        logger.reset();
    });

    afterEach(() => {
        logger.reset();
    });

    it('Smoke test for log methods', () => {

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
        expect(actualMessages).to.deep.equal(expectedMessages);
    });

    it('test reset()', () => {
        logger.debug('DEBUG!');
        logger.reset();

        const actualMessages = Object.assign({}, logger.getMessages());

        expect(actualMessages.debug).to.have.lengthOf(0);
    });
});

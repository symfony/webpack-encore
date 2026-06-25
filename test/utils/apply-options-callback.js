/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';

import applyOptionsCallback from '../../lib/utils/apply-options-callback.ts';

describe('utils/apply-options-callback', function () {
    it('mutates and returns the options object', function () {
        const options = { foo: 'bar' };
        const result = applyOptionsCallback((opts) => {
            opts.foo = 'baz';
        }, options);

        expect(result).toBe(options);
        expect(result.foo).toBe('baz');
    });

    it('returns the object returned by the callback when it returns one', function () {
        const result = applyOptionsCallback(() => ({ replaced: true }), { foo: 'bar' });

        expect(result).toEqual({ replaced: true });
    });

    it('binds the options object as `this`', function () {
        const options = { foo: 'bar' };
        let receivedThis;
        applyOptionsCallback(function () {
            receivedThis = this;
        }, options);

        expect(receivedThis).toBe(options);
    });

    it('forwards extra arguments to the callback after the options object', function () {
        const options = {};
        const extraA = { name: 'A' };
        const extraB = { name: 'B' };
        let receivedArgs;

        applyOptionsCallback(
            function (...args) {
                receivedArgs = args;
            },
            options,
            extraA,
            extraB
        );

        expect(receivedArgs).toEqual([options, extraA, extraB]);
        expect(receivedArgs[1]).toBe(extraA);
        expect(receivedArgs[2]).toBe(extraB);
    });
});

/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { describe, it, expect } from 'vitest';

import RuntimeConfig from '../../lib/config/RuntimeConfig.js';
import vueLoader from '../../lib/loaders/vue.js';
import WebpackConfig from '../../lib/WebpackConfig.js';

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = import.meta.dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/vue', function () {
    it('getLoaders() with extra options', function () {
        const config = createConfig();
        config.enableVueLoader((options) => {
            options.postLoaders = { foo: 'foo-loader' };
        });

        const actualLoaders = vueLoader.getLoaders(config);

        expect(actualLoaders).toHaveLength(1);
        expect(actualLoaders[0].options.postLoaders.foo).toBe('foo-loader');
    });

    it('getLoaders() with a callback that returns an object', function () {
        const config = createConfig();
        config.enableVueLoader((options) => {
            options.postLoaders = { foo: 'foo-loader' };

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = vueLoader.getLoaders(config);

        expect(actualLoaders).toHaveLength(1);
        expect(actualLoaders[0].options).toEqual({ foo: true });
    });
});

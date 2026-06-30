/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type RuntimeConfig from './config/RuntimeConfig.js';

/**
 * Stores the current RuntimeConfig created by the encore executable.
 */

export default {
    runtimeConfig: null as RuntimeConfig | null,
};

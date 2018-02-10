/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const logger = require('../logger');
logger.deprecation('The lib/webpack/webpack-manifest-plugin.js module is deprecated: require the library directly now: require(\'webpack-manifest-plugin\').');

module.exports = require('webpack-manifest-plugin');

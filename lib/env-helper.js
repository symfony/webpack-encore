/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const dotenv = require('dotenv');
const WebpackConfig = require('./WebpackConfig'); //eslint-disable-line no-unused-vars

/**
 * @param {Object.<String, String>} envVars
 * @param {String} path
 * @param {WebpackConfig} webpackConfig
 * @return {void}
 */
function loadEnv(envVars, path, webpackConfig) {
    if (fs.existsSync(path)) {
        load(envVars, path);
    } else if (fs.existsSync(`${path}.dist`)) {
        load(envVars, `${path}.dist`);
    }

    if (fs.existsSync(`${path}.local`)) {
        load(envVars, `${path}.local`);
    }

    const env = webpackConfig.isProduction() ? 'production' : 'development';
    populate(envVars, { NODE_ENV: env });

    const envShort = webpackConfig.isProduction() ? 'prod' : 'dev';
    if (fs.existsSync(`${path}.${envShort}`)) {
        load(envVars, `${path}.${envShort}`);
    }

    if (fs.existsSync(`${path}.${envShort}.local`)) {
        load(envVars, `${path}.${envShort}.local`);
    }
}

function load(envVars, path) {
    // TODO: replace dotenv package by our own implementation that should follow Symfony dotenv implementation
    const result = dotenv.config({ path });

    // TODO: improve error handling
    if (result.error) {
        throw result.error;
    }

    populate(envVars, result.parsed);
}

function populate(envVars, newEnvVars) {
    for (const envKey of Object.keys(newEnvVars)) {
        envVars[envKey] = newEnvVars[envKey];
    }
}

module.exports = {
    loadEnv,
};

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const chalk = require('chalk');
const features = require('../../features');
const packageHelper = require('../../package-helper');

function formatErrors(errors) {
    if (errors.length === 0) {
        return [];
    }

    let messages = [];
    for (let error of errors) {
        const fixes = [];

        if (error.featureName) {
            let neededCode = `Encore.${features.getFeatureMethod(error.featureName)}`;
            fixes.push(`Add ${chalk.green(neededCode)} to your webpack.config.js file.`);

            const loaderFeatureConfig = features.getFeatureConfig(error.featureName);
            const packageRecommendations = packageHelper.getPackageRecommendations(
                loaderFeatureConfig.packages
            );

            if (packageRecommendations) {
                fixes.push(`${packageRecommendations.message}\n              ${packageRecommendations.yarnInstall}`);
            }
        } else {
            fixes.push('You may need to install and configure a special feature');
        }

        if (error.featureName) {
            messages.push(`${chalk.bgGreen.black('', 'FIX', '')} To ${features.getFeatureDescription(error.featureName)}:`);
        } else {
            messages.push(`${chalk.bgGreen.black('', 'FIX', '')} To fix ${error.name}:`);
        }

        let index = 0;
        for (let fix of fixes) {
            messages.push(`        ${++index}. ${fix}`);
        }

        messages.push('');
    }

    return messages;
}

function format(errors) {
    return formatErrors(errors.filter((e) => (
        e.type === 'feature-not-enabled'
    )));
}

module.exports = format;

const chalk = require('chalk');
const loaderFeatures = require('../../loader-features');
const packageHelper = require('../../package-helper');

function formatErrors(errors) {
    if (errors.length === 0) {
        return [];
    }

    var messages = [];
    for (let error of errors) {
        const fixes = [];

        if (error.loaderName) {
            let neededCode = `Encore.${loaderFeatures.getLoaderFeatureMethod(error.loaderName)}`;
            fixes.push(`Add ${chalk.green(neededCode)} to your webpack.config.js file.`);

            const loaderFeatureConfig = loaderFeatures.getLoaderFeatureConfig(error.loaderName);
            const packageRecommendations = packageHelper.getPackageRecommendations(
                loaderFeatureConfig.packages
            );

            if (packageRecommendations) {
                fixes.push(`${packageRecommendations.message}\n              ${packageRecommendations.yarnInstall}`);

            }

            // TODO - I need some key that describes the "feature"
            // then, I need to be able to look up that dependency to
            // see what packages (if any) are missing
            // maybe even put the featureMethod into that file
        } else {
            fixes.push('You may need to install and configure a special loader for this file type.');
        }

        messages = messages.concat([
            chalk.red(`Error loading ${chalk.yellow(error.file)}`),
            ''
        ]);

        if (error.loaderName) {
            messages.push(`${chalk.bgGreen.black('', 'FIX', '')} To ${loaderFeatures.getLoaderFeatureDescription(error.loaderName)}:`);
        } else {
            messages.push(`${chalk.bgGreen.black('', 'FIX', '')} To load ${error.file}:`);
        }

        let index = 0;
        for (let fix of fixes) {
            messages.push(`        ${++index}. ${fix}`)
        }

        messages.push('');
    }
    return messages;

    var msg = chalk.bgGreen.black('', 'WOH', '');

    return [
        msg,
        'Hi',
        'Hello'
    ];
}

function format(errors) {
    return formatErrors(errors.filter((e) => (
        e.type === 'loader-not-enabled'
    )));
}

module.exports = format;
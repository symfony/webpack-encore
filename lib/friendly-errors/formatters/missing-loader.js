const chalk = require('chalk');

function formatErrors(errors) {
    if (errors.length === 0) {
        return [];
    }

    var messages = [];
    for (let error of errors) {
        let neededCode = `Encore.${error.featureMethod}`;
        const fixes = [];
        fixes.push(`Add ${chalk.green(neededCode)} to your webpack.config.js file.`);

        // TODO - I need some key that describes the "feature"
        // then, I need to be able to look up that dependency to
        // see what packages (if any) are missing
        // maybe even put the featureMethod into that file

        messages = messages.concat([
            chalk.red(`Error loading ${chalk.yellow(error.file)}`),
            '',
            `${chalk.bgGreen.black('', 'FIX', '')} To load ${error.loaderFileDescription}:`,
        ]);

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
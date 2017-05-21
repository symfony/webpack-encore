const chalk = require('chalk');

function ensurePackagesExist(packageNames, requestedFeature) {
    const recommendation = getPackageRecommendations(packageNames, requestedFeature);

    if (!recommendation) {
        return;
    }

    throw new Error(`
${recommendation.message}
  ${recommendation.yarnInstall}
`);
}

function getPackageRecommendations(packageNames, requestedFeature = null) {
    let missingPackageNames = [];

    for (let packageName of packageNames) {
        try {
            require.resolve(packageName);
        } catch(e) {
            missingPackageName.push(packageName);
        }
    }

    if (missingPackageName.length > 0) {
        throw new Error(error);
    }

    const missingPackageNamesChalked = missingPackageNames.map(function(packageName) {
        return chalk.green(packageName);
    });

    let message = `Install ${missingPackageNamesChalked.join(' & ')}`;
    if (requestedFeature) {
        message += ` to use ${chalk.green(requestedFeature)}`;
    }

    let yarnInstall = chalk.yellow(`yarn add ${missingPackageNames.join(' ')} --dev`);

    return {
        message,
        yarnInstall
    }
}

module.exports = {
    ensurePackagesExist,
    getPackageRecommendations
};

function ensurePackagesExist(packageNames, error) {
    let missingPackageName = [];

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

    let message = `You must install the ${missingPackageNames.join(' and ')} package${missingPackageNames.length > 1 ? 's' : ''} to use ${requestedFeature}`;
    let yarnInstalls = missingPackageNames.map((packageName) => {
        return `  yarn add ${packageName} --dev`;
    });

    throw new Error(`
${message}
${yarnInstalls.join("\n")}
`);
}

module.exports = {
    ensurePackagesExist
};

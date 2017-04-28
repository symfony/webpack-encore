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
}

module.exports = {
    ensurePackagesExist
};

function ensurePackageExists(packageName, error) {
    try {
        require.resolve(packageName);
    } catch(e) {
        throw new Error(error);
    }
}

module.exports = {
    ensurePackageExists
};

function ensurePackageExists(packageName, error) {
    try {
        require.resolve(packageName+'Doo');
    } catch(e) {
        throw new Error(`${error}
  yarn add ${packageName} --dev
  npm install ${packageName} --save-dev`
);
    }
}

module.exports = {
    ensurePackageExists
};

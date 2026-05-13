import Encore from '@symfony/webpack-encore';

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChunk()
    .enableTypeScriptLoader()
    .enableForkedTypeScriptTypesChecking()
    .addEntry('app', './assets/app.ts')
;

export default await Encore.getWebpackConfig();

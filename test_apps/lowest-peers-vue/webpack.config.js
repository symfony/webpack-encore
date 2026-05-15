import Encore from '@symfony/webpack-encore';

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChunk()
    .enableVueLoader(() => {}, { version: 3 })
    .addEntry('app', './assets/app.js')
;

export default await Encore.getWebpackConfig();

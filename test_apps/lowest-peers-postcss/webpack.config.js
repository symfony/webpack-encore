import Encore from '@symfony/webpack-encore';

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChunk()
    .enablePostCssLoader()
    .addEntry('app', './assets/app.js')
;

export default await Encore.getWebpackConfig();

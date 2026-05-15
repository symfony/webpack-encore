import Encore from '@symfony/webpack-encore';

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChunk()
    .enableStimulusBridge('./assets/controllers.json')
    .addEntry('app', './assets/app.js')
;

export default await Encore.getWebpackConfig();

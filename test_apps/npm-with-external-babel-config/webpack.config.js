const Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChunk()
    .addEntry('app', './assets/app.js')
;

module.exports = Encore.getWebpackConfig();

import Encore from '@symfony/webpack-encore';

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChunk()
    .addEntry('app', './assets/app.js')

    // Configure Babel
    .configureBabel((config) => {
        config.plugins.push(import.meta.resolve('@babel/plugin-proposal-partial-application'));
    })
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })
;

export default await Encore.getWebpackConfig();

module.exports = {
    presets: [
        [
            require.resolve('@babel/preset-env'),
            {
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3,
            },
        ],
    ],
    plugins: [
        require.resolve('@babel/plugin-proposal-partial-application')
    ]
};

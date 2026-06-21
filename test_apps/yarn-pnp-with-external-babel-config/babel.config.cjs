module.exports = {
    presets: [
        [
            require.resolve('@babel/preset-env'),
            {
                modules: false,
            },
        ],
    ],
    plugins: [
        [require.resolve('@babel/plugin-proposal-partial-application'), { version: '2018-07' }]
    ]
};

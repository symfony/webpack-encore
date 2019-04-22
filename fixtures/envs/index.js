(() => {
    console.log(`VAR_1: ${process.env.VAR_1}`);
    console.log(`VAR_2: ${process.env.VAR_2}`);
    console.log(`VAR_3: ${process.env.VAR_3}`);

    if (process.env.NODE_ENV === 'development') {
        console.log('Message in development environment');
    }

    if (process.env.NODE_ENV === 'production') {
        console.log('Message in production environment');
    }
})();

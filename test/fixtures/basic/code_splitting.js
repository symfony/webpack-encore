console.log('HI! I am code_splitting.js');

// use code splitting to load this file!
require.ensure(['./no_require'], function(require) {
    require('./no_require');
});

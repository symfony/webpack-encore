window.code_splitting_loaded = true;

// use code splitting to load this file!
require.ensure(['./no_require'], function(require) {
    require('./no_require');
});

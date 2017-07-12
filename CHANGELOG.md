# CHANGELOG

## 0.11.0

 * The `webpack` page was upgraded from version 2.2 to 3.1 #53. The
    `extract-text-webpack-plugin` package was also upgraded from
    2.1 to 3.0.

## 0.10.0

 * [BC BREAK] If you're using `enableSassLoader()` AND passing an options
   array, the options now need to be moved to the second argument:

   ```js
   // before
   .enableSassLoader({ resolve_url_loader: true });

   // after
   enableSassLoader(function(sassOptions) {}, {
       resolve_url_loader: true
   })
   ```

 * Allowing typescript options callback to be optional - #75

 * Allow the Encore singleton to be reset - #83

 * Fixing bug with vue-loader and sass - #89

## 0.9.1

 * Syntax error fix - #64

## 0.9.0

 * [BEHAVIOR CHANGE] When using `autoProvidejQuery()`, `window.jQuery` is now also
   included (and so will be re-written in the compiled files). If you're also exposing
   `jQuery` as a global variable, you'll need to update your code:

   ```js
   // Before: if you had this
   window.jQuery = require('jquery');

   // After: change to this
   global.jQuery = require('jquery');
   ```

  * Vue.js support! See #49

  * Typescript support! See #50

## 0.8.0

 * Windows support fixed #28

 * Added `Encore.addPlugin()` #19

 * Added `Encore.addLoader()` #11

 * `Encore.cleanupOutputBeforeBuild()` now empties the directory
   instead or removing it.


webpack-remix
=============

`Webpack Remix`_ is a JavaScript package provided by Symfony to simplify the
integration of `Webpack`_ into Symfony applications. It's not a replacement for
Webpack, but a thin API on top of it, so it stays in the same spirit of Webpack
and it doesn't hide or change any of its features. Using Webpack Remix is
optional, but recommended to improve your productivity.

Webpack Remix replaces `Assetic`_ as the recommended way to manage web assets in
Symfony applications. You can use it even if your application doesn't fully use
modern JavaScript features. However, if your application uses JavaScript
toolkits different than Webpack, such as Grunt or Gulp, you can't use this
package.

Installation
------------

Webpack Remix is a JavaScript package, so it's not installed using Composer but
using any of the JavaScript package managers (for example, `npm`_ and `yarn`_):

.. code-block:: terminal

    # if you prefer npm
    $ npm install --save-dev symfony/webpack-remix

    # if you prefer yarn
    $ yarn add symfony/webpack-remix

These commands create or modify the ``package.json`` file and the ``node_modules/``
directory at the root of your Symfony project. When using Yarn, a file called
``yarn.lock`` is also created or modified.

Basic Usage
-----------

First, create a file called ``webpack.config.js`` at the root of your Symfony
project. This file contains all the configuration related to front-end assets
and it's fully compatible with Webpack. This is the typical structure of the file:

.. code-block:: javascript

    var Remix = require('webpack-remix');

    Remix
        // where should all compiled files (CSS, JS, fonts) be stored?
        .setOutputPath('web/build/')
        // what's the public path to this directory (relative to your project's web/ dir)
        .setPublicPath('/build')

        // this adds JavaScript files/modules to the application
        .addEntry(...)
        .addEntry(...)
        .addEntry(...)
        // this adds CSS/Sass files to the application
        .addStylesEntry(...)
        .addStylesEntry(...)
        .addStylesEntry(...)
    ;

    // export the final configuration
    module.exports = Remix.getWebpackConfig();

The First Example
-----------------

Let's consider that you are adding Webpack Remix to a simple tradicionatl/legacy
Symfony application that uses Bootstrap Saas and defines just these two files:
``app.scss`` and ``app.js`` in ``app/Resources/assets/``.

First, install Bootstrap Sass and jQuery as dependencies of your application
front-end:

.. code-block:: terminal

    $ yarn add jquery bootstrap-sass

Then, require those JavaScript/Sass modules from your own files:

.. code-block:: css

    // app/Resources/assets/scss/app.scss
    @import '~bootstrap-saas'

    // ...add here your own application styles

.. code-block:: js

    // app/Resources/assets/ks/app.js
    @require('jquery');
    @require('bootstrap-saas');

    // ...add here your own application JavaScript code

Finally, define the Webpack Remix configuration needed to compile these assets
and generate the final ``app.css`` and ``app.js`` files served by the application:

.. code-block:: javascript

    var Remix = require('webpack-remix');

    Remix
        .setOutputPath('web/build/')
        .setPublicPath('/build')
        .autoProvidejQuery() // this option is explained later

        // will create a web/build/js/app.js
        .addEntry('js/app', './app/Resources/assets/js/app.js')
        // will create a web/build/css/app.css
        .addStylesEntry('css/app', './app/Resources/assets/scss/app.scss')
    ;

    module.exports = Remix.getWebpackConfig();

The final missing step is to actually compile the assets using the
``webpack.config.js`` configuration, as explained in the next section. Then you
can link to the compiled assets from the templates of your Symfony application:

.. code-block:: twig

    <!DOCTYPE html>
    <html>
        <head>
            <!-- ... -->
            <link rel="stylesheet" href="{{ asset('/build/css/app.css') }}">
        </head>
        <body>
            <!-- ... -->
            <script src="{{ asset('/build/js/app.js') }}"></script>
        </body>
    </html>

Compiling your Assets
---------------------

Once your JavaScript and CSS files have been created and your ``webpack.config.js``
file has been defined, you are ready to compile the assets and use them in your
application. There are several commands available because depending on the
execution environment (``dev`` or ``prod``) you may need to compile assets faster
or compile them as smaller files:

.. code-block:: terminal

    # in 'dev' environment, run this command to compile assets once
    $ ./node_modules/.bin/webpack --progress
    # ... you can use '--watch' to recompile automatically if assets change
    $ ./node_modules/.bin/webpack --progress --watch

    # in production servers, run this command to reduce the size of all files
    $ NODE_ENV=production ./node_modules/.bin/webpack

Enabling Source Maps
--------------------

`Source maps`_ allow browsers to access to the original code related to some
asset (e.g. the Sass code that was compiled to CSS or the TypeScript code that
was compiled to JavaScript). Source maps are useful for debugging purposes but
unnecessary when executing the application in production.

Webpack Remix inlines source maps in the compiled assets only in the development
environment, but you can control this behavior with the ``enableSourceMaps()``
method:

.. code-block:: javascript

    var Remix = require('webpack-remix');

    Remix
        // ...

        // this is the default behavior...
        .enableSourceMaps(!Remix.isProduction())
        // ... but you can override it by passing a boolean value
        .enableSourceMaps(true)
    ;

Creating Shared Entries
-----------------------

For performance reasons, it's usual to extract a few common modules into a
separate JavaScript file that it's included in every page. Besides, this
improves the performance of your application because this "common file" (usually
called "vendor file") rarely changes, so the browsers can cache it for a long
time. Create this vendor file with the ``createSharedEntry()`` method:

.. code-block:: javascript

    Remix
        // ...
        .addEntry('...', '...')
        .addEntry('...', '...')
        .addEntry('...', '...')
        // this creates a 'vendor.js' file with the code of the jQuery' and
        // Bootstrap JavaScript modules
        .createSharedEntry('vendor', ['jquery', 'bootstrap-sass'])

As soon as you make this change, you need to include two extra JavaScript files
on your page before any other JavaScript file:

.. code-block:: twig

    <!-- these two files now must be included in every page -->
    <script src="{{ asset_path('build/manifest.js') }}"></script>
    <script src="{{ asset_path('build/vendor.js') }}"></script>
    <!-- here you link to the specific JS files needed by the current page -->
    <script src="{{ asset_path('build/app.js') }}"></script>

The ``vendor.js`` file contains all the common code that has been extracted from
the other files, so it's obvious that must be included. The other file (``manifest.js``)
is less obvious, but it's needed so webpack knows how to load those shared modules.

Asset Versioning
----------------

Use the ``enableVersioning()`` method to add a hash signature to the name of the
compiled assets (e.g. ``app.123abc.js`` instead of ``app.js``). This allows to
use aggressive caching strategies that set the expire time very far in time,
because whenever a file change, its hash will change and the link to the asset
will also change, invalidating any existing cache:

.. code-block:: javascript

    Remix
        // ...
        .addEntry('app', '...')
        .addEntry('...', '...')
        .addEntry('...', '...')
        // add hashing to all asset filenames
        .enableVersioning()

Since the filename of the assets is unknown and can change constantly, you cannot
link to those assets in your templates. USe the ``asset_path()`` Twig function
provided by Symfony to link to them:

.. code-block:: twig

    {# asset_path() takes the entry name + .js or .css, and looks up the real path #}
    <script src="{{ asset_path('app.js') }}"></script>

Creating your JavaScript Files
------------------------------

When using Webpack in Symfony applications, your JavaScript files can make use
of advanced features such as requiring other JavaScript files or modules. The
``require()`` instruction is similar to the PHP ``require()`` instruction, but
the handling of file paths is a bit different:

.. code-block:: javascript

    // app/Resources/assets/js/showcase.js

    // when no file path is defined (i.e. no file extension) webpack loads the
    // given JavaScript module installed in node_modules/ dir (webpack knows all
    // the specific files that must be loaded and in which order)
    require('bootstrap-star-rating');

    // when a file path is given, but it doesn't start with '/' or './', the file
    // path is considered relative to node_modules/ dir
    require('bootstrap-star-rating/css/star-rating.css');

    // when a file path is given and it starts with '/' or './', it's considered
    // as the full file path for the asset (it can live outside the node_modules/ dir)
    require('../../../../../node_modules/bootstrap-star-rating/themes/krajee-svg/theme.css');

    // ...

Using SASS
----------

Remix automatically processes any files that end in ``.sass``
or ``.scss``. No setup required!

Using LESS
----------

To use the LESS pre-processor, first install ``less`` and
the ``less-loader``:

.. code-block:: terminal

    npm install less-loader less --save-dev

Now, just enable it in ``webpack.config.js``:

.. code-block:: javascript

    // webpack.config.js
    var Remix = require('webpack-remix');

    Remix
        // ...
        .enableLess()
    ;

That's it! All files ending in ``.less`` will be pre-processed!

Passing Information from Twig to JavaScript
-------------------------------------------

In Symfony applications, Twig is executed on the server and JavaScript on the
browser. However, you can bridge them in templates executing Twig code to
generate code or contents that are processed later via JavaScript:

.. code-block: twig

    RatingPlugin('.user-rating').create({
        // when Twig code is executed, the application checks for the existence of the
        // user and generates the appropriate value that is used by JavaScript later
        disabled: "{{ app.user ? 'true' : 'false' }}",
        // ...
    });

When using webpack-remix you can no longer use this technique because Twig and
JavaScript are completely separated. The alternative solution is to use HTML
``data`` attributes to store some information that is retrieved later by
JavaScript:

.. code-block:: twig

    <div class="user-rating" data-is-logged="{{ app.user ? 'true' : 'false' }}">
        <!-- ... -->
    </div>

There is no size limit in the value of the ``data-`` attributes, so you can
store any content, no matter its length. The only caveat is that you must encode
the value using Twig's `html` escaping strategy to avoid messing with HTML
attributes:

.. code-block:: twig

    <div data-user-profile="{{ app.user ? app.user.profileAsJson|e('html') : '' }}">
        <!-- ... -->
    </div>

jQuery and Legacy Applications
------------------------------

Some legacy JavaScript applications use programming practices that doesn't go
along with the new practices promoted by webpack. The most common of those
problems is using code (e.g. jQuery plugins) that assume that jQuery is already
available via the the ``$`` or ``jQuery`` global variables. If those variables
are not defined, you'll get these errors:

.. code-block:: text

    Uncaught ReferenceError: $ is not defined at [...]
    Uncaught ReferenceError: jQuery is not defined at [...]

Instead of rewriting all those applications, webpack-remix proposes a different
solution. Thanks to the ``autoProvidejQuery()`` method, whenever a JavaScript
file uses the ``$`` or ``jQuery`` variables, webpack automatically requires
jQuery and creates those variables for you.

So, when working with legacy applications, add the following to your ``webpack.config.js``
file:

.. code-block:: javascript

    Remix
        .autoProvidejQuery()
        .addEntry('...', '...')
        // ...
    ;

Internally, this ``autoProvidejQuery()`` method uses the ``autoProvideVariables()``
method from webpack. In practice, it's equivalent to doing:

.. code-bloc:: javascript

    Remix
        // you can use this method to provide other common global variables,
        // such as '_' for the 'underscore' library
        .autoProvideVariables({
            $: 'jquery',
            jQuery: 'jquery'
        })
        .addEntry('...', '...')
        // ...
    ;

If you also need to provide access to ``$`` and ``jQuery`` variables outside of
the JavaScript files processed by webpack, you must create the global variables
yourself in some file loaded before the legacy JavaScript code. For example, you
can define a ``common.js`` file processed by webpack and loaded in every page
with the following content:

.. code-block:: javascript

    window.$ = window.jQuery = require('jquery');

Full Configuration Example
--------------------------

.. TODO:
.. Show here a full and complex example of using Webpack Remix in a real
.. Symfony application such as symfony.com

Configuring Babel
-----------------

Babel_ is automatically configured for all ``.js`` files via the
``babel-loader``. By default, the ``env`` preset is used without
any extra options.

Need to configure Babel yourself? No problem - there are two options:

.. code-block:: javascript

    // webpack.config.js
    var Remix = require('webpack-remix');

    Remix
        // ...

        // Option 1) configure babel right inside webpack.config.js
        .configureBabel(function(babelConfig) {
            babelConfig.presets.push('es2017');
        })

        // Option 2) Create a .babelrc file, then tell Remix it exists
        .useBabelRcFile()
    ;

If you create a ``.babelrc`` file, don't forget to call ``useBabelRcFile()``.
Otherwise, the default config will override your file's settings.

Using React
-----------

Using React? No problem! Make sure you have React installed,
along with the `babel-preset-react`_:

.. code-block:: terminal

    npm react react-dom --save-dev
    npm install babel-preset-react --save-dev

Next, enable react in your ``webpack.config.js``:

.. code-block:: javascript

    // webpack.config.js
    var Remix = require('webpack-remix');

    Remix
        // ...
        .enableReact()
    ;

That's it! Your ``.js`` and ``.jsx`` files will now be transformed
using the ``babel-react-loader``!

Enabling PostCSS (postcss-loader)
---------------------------------

`PostCSS`_ is a CSS post-processing tool that can transform your
CSS in a lot of cool ways, like `autoprefixing`_, `linting`_ and
a lot more!

First, download ``postcss-loader`` and ``postcss-load-config``:

.. code-block:: terminal

    npm install postcss-loader postcss-load-config --save-dev

Next, create a ``postcss.config.js`` file at the root of your project:

.. code-block:: javascript

    module.exports = {
        plugins: [
            // include whatever plugins you want
            // but make sure you install these via npm/yarn!
            require('autoprefixer')
        ]
    }

Finally, enable PostCSS in Remix:

.. code-block:: javascript

    // webpack.config.js
    var Remix = require('webpack-remix');

    Remix
        // ...
        .enablePostCss()
    ;

That's it! The ``postcss-loader`` will now be used for all CSS, SASS, etc
files.

Cleaning up old Files
---------------------

If you use versioning, then eventually your output directory
will have a *lot* of old files. No problem! Just tell Webpack
to clean up the directory before each build:

.. code-block:: javascript

    // webpack.config.js
    var Remix = require('webpack-remix');

    Remix
        .setOutputPath('web/build/')
        // ...

        // will empty the web/build directory before each build
        .cleanupOutputBeforeBuild()
    ;

.. _`Webpack Remix`: https://www.npmjs.com/package/@weaverryan/webpack-remix
.. _`Webpack`: https://webpack.js.org/
.. _`Assetic`: http://symfony.com/doc/current/assetic/asset_management.html
.. _`npm`: https://www.npmjs.com/
.. _`yarn`: https://yarnpkg.com/
.. _`Source maps`: https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map
.. _`PostCSS`: http://postcss.org/
.. _`autoprefixing`: https://github.com/postcss/autoprefixer
.. _`linting`: https://stylelint.io/
.. _`Babel`: http://babeljs.io/
.. _`babel-react-preset`: https://babeljs.io/docs/plugins/preset-react/

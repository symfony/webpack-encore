webpack-remix
=============

Remix is a wrapper to simplify making webpack configuration, while still staying
in the spirit of webpack!

Basic Usage
-----------

All the configuration lives in a file called ``webpack.config.js`` stored in the
root directory of your project:

.. code-block:: javascript

    var Remix = require('webpack-remix');

    Remix
        // where should all compiled files be stored?
        .setOutputDir('web/builds/')
        // what's the public path to this directory (relative to your project's web/ dir)
        .setPublicPath('/builds')

        // will create a web/builds/app.js
        .addEntry('app', './app/Resources/assets/js/app.js')
        // will create a web/builds/checkout.js, which you might
        // include on an individual page only
        .addEntry('checkout', './app/Resources/assets/js/checkout-page.js')

        // add a styles-only entry. Feel free to mix CSS and Sass!
        // will create a style.css
        .addStylesEntry('styles', [
            './app/Resources/assets/scss/app.scss',
            './app/Resources/assets/css/font-lato.css',
            './app/Resources/assets/css/highlight-solarized-light.css'
        ])

        // source maps only when NOT in production
        Remix.enableSourceMaps(!Remix.isProduction())
    ;

    // export the final configuration
    module.exports = Remix.getWebpackConfig();

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
        // this creates a 'vendor.js' file with the code of the 'jquery' and
        // 'moment' JavaScript modules
        .createSharedEntry('vendor', ['jquery', 'moment'])

As soon as you make this change, you need to include two extra JavaScript files
on your page before any other JavaScript file:

.. code-block:: twig

    <!-- these two files now must be included in every page -->
    <script src="{{ asset_path('builds/manifest.js') }}"></script>
    <script src="{{ asset_path('builds/vendor.js') }}"></script>
    <!-- here you link to the specific JS files needed by the current page -->
    <script src="{{ asset_path('builds/app.js') }}"></script>

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

Configuring Babel
-----------------

Babel_ is automatically configured for all ``.js`` files via the
``babel-loader``. By default, the ``env`` preset is used without
any extra options.

Need to configure Babel yourself? No problem - there are two options:

```javascript
    // webpack.config.js
    var Remix = require('webpack-remix');

    Remix
        // ...

        // Option 1) configure babel right inside webpack.config.js
        .configureBabel({
            "presets": ["env"],
            "plugins": ["babel-plugin-transform-class-properties"],
        })

        // Option 2) Create a .babelrc file, then tell Remix it exists
        .useBabelRcFile()
    ;
```

If you create a ``.babelrc`` file, don't forget to call ``useBabelRcFile()``.
Otherwise, the default config will override your file's settings.

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

.. _`PostCSS`: http://postcss.org/
.. _`autoprefixing`: https://github.com/postcss/autoprefixer
.. _`linting`: https://stylelint.io/
.. _`Babel`: http://babeljs.io/

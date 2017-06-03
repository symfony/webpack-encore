Webpack Encore
==============

`Webpack Encore`_ is a JavaScript package provided by Symfony to simplify the
integration of `Webpack`_ into Symfony applications. It's not a replacement for
Webpack, but a thin API on top of it, so it stays in the same spirit of Webpack
and it doesn't hide or change any of its features. Using Encore is
optional, but recommended to improve your productivity.

Webpack Encore replaces `Assetic`_ as the recommended way to manage web assets in
Symfony applications. You can use it even if your application doesn't fully use
modern JavaScript features. However, if your application uses JavaScript
toolkits different than Webpack, such as Grunt or Gulp, you can't use this
package.

Installation
------------

First, make sure you `install Node.js`_ and also the `yarn package manager`_.

Then, install Encore with yarn:

.. code-block:: terminal

    $ yarn add @weaverryan/webpack-remix

.. note::

    This article uses the `yarn`_ package manager to install JavaScript packages.
    If you prefer to use `npm`_, replace ``yarn add xxx`` by ``npm install xxx``
    and ``yarn add --dev xxx`` by ``npm install --save-dev xxx``.

These commands create or modify the ``package.json`` file and the ``node_modules/``
directory at the root of your Symfony project. When using Yarn, a file called
``yarn.lock`` is also created or modified.

Basic Usage
-----------

First, create a file called ``webpack.config.js`` at the root of your Symfony
project. This file contains all the configuration related to front-end assets
and it's fully compatible with Webpack. This is the typical structure of the file:

.. code-block:: javascript

    var Encore = require('@weaverryan/webpack-remix');

    Encore
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
    module.exports = Encore.getWebpackConfig();

To build the assets, use the ``encore`` executable:

.. code-block:: terminal

    $ ./node_modules/.bin/encore dev

The First Example
-----------------

Let's consider that you are adding Encore to a simple traditional/legacy
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
    require('jquery');
    require('bootstrap-saas');

    // ...add here your own application JavaScript code

Finally, define the Encore configuration needed to compile these assets
and generate the final ``app.css`` and ``app.js`` files served by the application:

.. code-block:: javascript

    var Encore = require('@weaverryan/webpack-remix');

    Encore
        .setOutputPath('web/build/')
        .setPublicPath('/build')
        .autoProvidejQuery() // this option is explained later

        // will create a web/build/js/app.js
        .addEntry('js/app', './app/Resources/assets/js/app.js')
        // will create a web/build/css/app.css
        .addStylesEntry('css/app', './app/Resources/assets/scss/app.scss')
    ;

    module.exports = Encore.getWebpackConfig();

The final missing step is to actually compile the assets using the
``webpack.config.js`` configuration, as explained in the next section. Then you
can link to the compiled assets from the templates of your Symfony application:

.. code-block:: twig

    <!DOCTYPE html>
    <html>
        <head>
            <!-- ... -->
            <link rel="stylesheet" href="{{ asset('build/css/app.css') }}">
        </head>
        <body>
            <!-- ... -->
            <script src="{{ asset('build/js/app.js') }}"></script>
        </body>
    </html>

Compiling your Assets
---------------------

Once your JavaScript and CSS files have been created and your ``webpack.config.js``
file has been defined, you are ready to compile the assets and use them in your
application. There are several commands available because depending on the
execution environment (dev versus production) you may need to compile assets faster
or compile them as smaller files:

.. code-block:: terminal

    # in 'dev' environment, run this command to compile assets once
    $ ./node_modules/.bin/encore dev
    # ... you can use '--watch' to recompile automatically if assets change
    $ ./node_modules/.bin/encore dev --watch

    # in production servers, run this command to reduce the size of all files
    $ ./node_modules/.bin/encore production

.. note::

    You will need to restart ``encore`` each time you update
    your ``webpack.config.js`` file.

Hot Module Replacement (HRM) & webpack-dev-server
-------------------------------------------------

`Hot Module Replacement`_ is a Webpack concept where "modules" can be automatically
updated in the browser without needing to refresh the page!

To use it, execute encore with the ``dev-server`` option:

.. code-block:: terminal

    ./node_modules/.bin/encore dev-server --hot --inline

This serves the assets from a new server at ``http://localhost:8080``.
If you've activated the :ref:`manifest.json versioning <load-manifest-files>`
you're done! The paths in your templates will automatically point to the dev server.

That's it! Now, modify a CSS file - you should see your browser
update without needing to refresh! To use it with JavaScript, you'll
need to do a bit more work. For example, see this article about
using `HMR with React`_.

Enabling Source Maps
--------------------

`Source maps`_ allow browsers to access to the original code related to some
asset (e.g. the Sass code that was compiled to CSS or the TypeScript code that
was compiled to JavaScript). Source maps are useful for debugging purposes but
unnecessary when executing the application in production.

Encore inlines source maps in the compiled assets only in the development
environment, but you can control this behavior with the ``enableSourceMaps()``
method:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        // ...

        // this is the default behavior...
        .enableSourceMaps(!Encore.isProduction())
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

    Encore
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
    <script src="{{ asset('build/manifest.js') }}"></script>
    <script src="{{ asset('build/vendor.js') }}"></script>
    <!-- here you link to the specific JS files needed by the current page -->
    <script src="{{ asset('build/app.js') }}"></script>

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

    Encore
        // ...
        .addEntry('app', '...')
        .addEntry('...', '...')
        .addEntry('...', '...')
        // add hashing to all asset filenames
        .enableVersioning()

How, each filename will have a hash automatically added to its
filename. To link to these assets, Encore creates a ``manifest.json``
file with all the new filenames (explained next).

.. _load-manifest-files:

Loading Assets from the manifest.json File
------------------------------------------

Whenever you run webpack, a ``manifest.json`` file is automatically
created in your ``outputPath`` directory:

.. code-block:: json

    {
        "build/app.js": "/build/app.123abc.js",
        "build/dashboard.css": "/build/dashboard.a4bf2d.css"
    }

To include ``script`` and ``link`` on your page that point to the
correct path, you need to read this.

If you're using Symfony, it's easy! Just activate the ``json_manifest_file``
versioning strategy in ``config.yml``:

.. code-block:: yaml

    # app/config/config.yml
    framework:
        # ...
        assets:
            # feature is supported in Symfony 3.3 and higher
            json_manifest_path: '%kernel.project_dir%/build/manifest.json'

That's it! Just be sure to wrap each path in the Twig ``asset()`` function
like normal:

.. code-block:: twig

    <script src="{{ asset('build/app.js') }}"></script>

    <link href="{{ asset('build/dashboard.css') }}" rel="stylesheet" />

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

To use the SASS pre-processor, first install the dependencies:

.. code-block:: terminal

    yarn add --dev sass-loader node-sass

Now, just enable it in ``webpack.config.js``:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        // ...
        .enableSassLoader()
    ;

That's it! All files ending in ``.sass`` or ``.scss`` will
be processed.

Using LESS
----------

To use the LESS pre-processor, first install ``less`` and
the ``less-loader``:

.. code-block:: terminal

    yarn add --dev less-loader less

Now, just enable it in ``webpack.config.js``:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        // ...
        .enableLessLoader()
    ;

That's it! All files ending in ``.less`` will be pre-processed!

Passing Information from Twig to JavaScript
-------------------------------------------

In Symfony applications, Twig is executed on the server and JavaScript on the
browser. However, you can bridge them in templates executing Twig code to
generate code or contents that are processed later via JavaScript:

.. code-block:: twig

    RatingPlugin('.user-rating').create({
        // when Twig code is executed, the application checks for the existence of the
        // user and generates the appropriate value that is used by JavaScript later
        disabled: "{{ app.user ? 'true' : 'false' }}",
        // ...
    });

When using Encore you can no longer use this technique because Twig and
JavaScript are completely separated. The alternative solution is to use HTML
``data`` attributes to store some information that is retrieved later by
JavaScript:

.. code-block:: twig

    <div class="user-rating" data-is-logged="{{ app.user ? 'true' : 'false' }}">
        <!-- ... -->
    </div>

There is no size limit in the value of the ``data-`` attributes, so you can
store any content, no matter its length. The only caveat is that you must encode
the value using Twig's ``html`` escaping strategy to avoid messing with HTML
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

Instead of rewriting all those applications, Encore proposes a different
solution. Thanks to the ``autoProvidejQuery()`` method, whenever a JavaScript
file uses the ``$`` or ``jQuery`` variables, webpack automatically requires
jQuery and creates those variables for you.

So, when working with legacy applications, add the following to your ``webpack.config.js``
file:

.. code-block:: javascript

    Encore
        .autoProvidejQuery()
        .addEntry('...', '...')
        // ...
    ;

Internally, this ``autoProvidejQuery()`` method uses the ``autoProvideVariables()``
method from webpack. In practice, it's equivalent to doing:

.. code-block:: javascript

    Encore
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
.. Show here a full and complex example of using Encore in a real
.. Symfony application such as symfony.com

Configuring Babel
-----------------

Babel_ is automatically configured for all ``.js`` and ``.jsx`` files
via the ``babel-loader`` with sensible defaults (e.g. with the ``env``
preset and ``react`` if requested).

Need to extend the Babel configuration further? No problem! The easiest
way is via ``configureBabel()``:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        // ...

        // modify our default Babel configuration
        .configureBabel(function(babelConfig) {
            babelConfig.presets.push('es2017');
        })
    ;

You can also create a standard ``.babelrc`` file at the root of your project.
Just make sure to configure it with all the presets you need: as soon as a
``.babelrc`` is present, Encore can no longer add *any* Babel configuration for you!

Using React
-----------

Using React? No problem! Make sure you have React installed,
along with the `babel-preset-react`_:

.. code-block:: terminal

    yarn add --dev react react-dom
    yarn add --dev babel-preset-react

Next, enable react in your ``webpack.config.js``:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        // ...
        .enableReactPreset()
    ;

That's it! Your ``.js`` and ``.jsx`` files will now be transformed
through ``babel-preset-react``.

Enabling PostCSS (postcss-loader)
---------------------------------

`PostCSS`_ is a CSS post-processing tool that can transform your
CSS in a lot of cool ways, like `autoprefixing`_, `linting`_ and
a lot more!

First, download ``postcss-loader`` and ``postcss-load-config``:

.. code-block:: terminal

    yarn add --dev postcss-loader

Next, create a ``postcss.config.js`` file at the root of your project:

.. code-block:: javascript

    module.exports = {
        plugins: {
            // include whatever plugins you want
            // but make sure you install these via yarn or npm!
            autoprefixer: {}
        }
    }

Finally, enable PostCSS in Encore:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        // ...
        .enablePostCssLoader()
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
    // ...

    Encore
        .setOutputPath('web/build/')
        // ...

        // will empty the web/build directory before each build
        .cleanupOutputBeforeBuild()
    ;

Using a CDN
-----------

Are you deploying to a CDN? That's awesome :) - and configuring
Encore for that is easy. Once you've made sure that your built files
are uploaded to the CDN, configure it in Encore:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        .setOutputPath('web/build/')
        // in dev mode, don't use the CDN
        .setPublicPath('/build');
        // ...
    ;

    if (Encore.isProduction()) {
        Encore.setPublicPath('https://my-cool-app.com.global.prod.fastly.net');
        // guarantee that the keys in manifest.json are *still*
        // prefixed with build/
        // (e.g. "build/dashboard.js": "https://my-cool-app.com.global.prod.fastly.net/dashboard.js")
        Encore.setManifestKeyPrefix('build/');
    }

That's it! Internally, Webpack will now know to load assets from your
CDN - e.g. ``https://my-cool-app.com.global.prod.fastly.net/dashboard.js``.
You just need to make sure that the ``script`` and ``link`` tags you include on
your pages also uses the CDN. Fortunately, the ``manifest.json`` is automatically
updated to point to the CDN. In Symfony, as long as you've configured `Asset Versioning`_,
the ``asset()`` function will take care of things for you, with no changes.

.. code-block:: js

    {# Same code you had before and setting up the CDN #}
    <script src="{{ asset('build/dashboard.js') }}"></script>

.. _`Webpack Encore`: https://www.npmjs.com/package/@weaverryan/webpack-remix
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
.. _`Hot Module Replacement`: https://webpack.js.org/concepts/hot-module-replacement/
.. _`HMR with React`: https://webpack.js.org/guides/hmr-react/
.. _`install Node.js`: https://nodejs.org/en/download/
.. _`yarn package manager`: https://yarnpkg.com/lang/en/docs/install/

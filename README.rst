webpack-remix
=============

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

    var Remix = require('./symfony-remix');

    Remix
        .autoProvidejQuery()
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

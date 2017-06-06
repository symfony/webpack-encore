Using webpack-dev-server and HMR
================================

While developing, instead of using ``encore dev --watch``, you can
instead use the `webpack-dev-server`_:

.. code-block:: terminal

    ./node_modules/.bin/encore dev-server

.. note::

    Hot module replacement is not currently supported.

This serves the built assets from a new server at ``http://localhost:8080``
(it does not actually write any files to disk). This means your
``script`` and ``link`` tags need to change to point to this.

If you've activated the :ref:`manifest.json versioning <load-manifest-files>`
you're done: the paths in your templates will automatically point to the dev server.

.. _`webpack-dev-server`: https://webpack.js.org/configuration/dev-server/

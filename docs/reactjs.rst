Enabling React.js
=================

Using React? Make sure you have React installed, along with the
`babel-preset-react`_:

.. code-block:: terminal

    yarn add --dev react react-dom babel-preset-react

Enable react in your ``webpack.config.js``:

.. code-block:: javascript

    // webpack.config.js
    // ...

    Encore
        // ...
        .enableReactPreset()
    ;

That's it! Your ``.js`` and ``.jsx`` files will now be transformed through
``babel-preset-react``.

.. _`babel-react-preset`: https://babeljs.io/docs/plugins/preset-react/

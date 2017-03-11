# webpack-remix

## Passing information from Twig to JavaScript

In Symfony applications, Twig is executed on the server and JavaScript on the
browser. However, you can bridge them in templates executing Twig code to generate
code or contents that are processed later via JavaScript:

```js
RatingPlugin('.user-rating').create({
    // when Twig code is executed, the application checks for the existence of the
    // user and generates the appropriate value that is used by JavaScript later
    disabled: "{{ app.user ? 'true' : 'false' }}",
    // ...
});
```

When using XXX you can no longer use this technique because Twig and JavaScript
are completely separated. The alternative solution is to use HTML `data`
attributes to store some information that is retrieved later by JavaScript:

```twig
<div class="user-rating" data-is-logged="{{ app.user ? 'true' : 'false' }}">
    <!-- ... -->
</div>
```

There is no size limit in the value of the `data-` attributes, so you can store
any content, no matter its length. The only caveat is that you must encode the
value using Twig's `html` escaping strategy to avoid messing with HTML attributes:

```twig
<div data-user-profile="{{ app.user ? app.user.profileAsJson|e('html') : '' }}">
    <!-- ... -->
</div>
```

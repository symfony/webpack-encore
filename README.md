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
are completely separated. The best alternative solution is to use HTML `data`
attributes to store some information that is retrieved later by JavaScript:

```twig
<div class="user-rating" data-is-logged="{{ app.user ? 'true' : 'false' }}">
    <!-- ... -->
</div>
```

If the content to store is too large, you can also create a JavaScript variable
via Twig and retrieve it later with JavaScript:

```twig
<script>
    var userProfile = "{{ user.profileAsJson|raw }}";
</script>
```

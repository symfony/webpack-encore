Using Bootstrap CSS & JS
========================

TODO - show how to bring in bootstrap JS and bootstrap-sass.

Here is an example from before to include... because I think it's really nice :).

    // when no file path is defined (i.e. no file extension) Webpack loads the
    // given JavaScript module installed in node_modules/ dir (Webpack knows all
    // the specific files that must be loaded and in which order)
    require('bootstrap-star-rating');

    // when a file path is given, but it doesn't start with '/' or './', the file
    // path is considered relative to node_modules/ dir
    require('bootstrap-star-rating/css/star-rating.css');

    // when a file path is given and it starts with '/', './', or '../', it's considered
    // as the full file path for the asset (it can live outside the node_modules/ dir)
    require('../../../../../node_modules/bootstrap-star-rating/themes/krajee-svg/theme.css');

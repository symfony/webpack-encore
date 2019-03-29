<template>
  <div id="app" class="red large justified lowercase" :class="[$css.italic, $scss.bold, $less.underline, $stylus.rtl]"></div>
</template>

<style>
  .red {
    color: red;
  }
</style>

<style lang="scss">
  .large {
    font-size: 50px;
  }
</style>

<style lang="less">
  .justified {
    text-align: justify;
  }
</style>

<style lang="styl">
  .lowercase
    text-transform: lowercase
</style>

<style module="$css">
  .italic {
    font-style: italic;
  }
</style>

<style lang="scss" module="$scss">
  .bold {
    font-weight: bold;
  }
</style>

<style lang="less" module="$less">
  .underline {
    text-decoration: underline;
  }
</style>

<style lang="styl" module="$stylus">
  .rtl
    direction: rtl;
</style>
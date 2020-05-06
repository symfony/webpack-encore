<template>
  <div class="red large justified lowercase block" :class="[$css.italic, $scss.bold, $less.underline, $stylus.rtl, $postcss.hidden]"></div>
</template>

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

<style lang="postcss" module="$postcss">
  .hidden {
    visibility: hidden;
  }
</style>

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

<style lang="postcss">
  .block {
    display: block;
  }
</style>

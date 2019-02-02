<template>
  <div id="app" class="red" :class="$style.italic"></div>
</template>

<style>
  .red {
    color: red;
  }
</style>

<style module>
  .italic {
    font-style: italic;
  }
</style>

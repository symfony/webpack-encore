<template>
  <div id="app">
    <img :src="logoPath">
    <hello></hello>
  </div>
</template>

<script lang="ts">
import Hello from './components/Hello.vue'
import logoPath from './assets/logo.png';

class TestClassSyntax {

}

export default {
  name: 'app',
  components: {
    Hello
  },
  computed: {
    logoPath: () => logoPath
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

<style lang="scss">
#app {
  display: flex;
  color: #2c3e90;
}
</style>

<style lang="less">
#app {
  margin-top: 40px;
}
</style>

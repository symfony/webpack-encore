<template>
  <div id="app">
    <img src="./assets/logo.png">
    <hello></hello>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Hello from './components/Hello.vue'

class TestClassSyntax {

}

export default Vue.extend({
  name: 'app',
  components: {
    Hello
  }
})
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

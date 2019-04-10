import styles from './Hello.css?module';

export default {
  name: 'hello',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
    };
  },
  render() {
    return (
      <div class="hello">
        <h1 class={styles.h1}>{this.msg}</h1>
        <h2 class={styles.h2}>Essential Links</h2>
        <ul class={styles.ul}>
          <li class={styles.li}><a class={styles.a} href="https://vuejs.org" target="_blank">Core Docs</a></li>
          <li class={styles.li}><a class={styles.a} href="https://forum.vuejs.org" target="_blank">Forum</a></li>
          <li class={styles.li}><a class={styles.a} href="https://gitter.im/vuejs/vue" target="_blank">Gitter Chat</a></li>
          <li class={styles.li}><a class={styles.a} href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
          <br/>
          <li class={styles.li}><a class={styles.a} href="http://vuejs-templates.github.io/webpack/" target="_blank">Docs for This Template</a></li>
        </ul>
        <h2 class={styles.h2}>Ecosystem</h2>
        <ul class={styles.ul}>
          <li class={styles.li}><a class={styles.a} href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
          <li class={styles.li}><a class={styles.a} href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
          <li class={styles.li}><a class={styles.a} href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
          <li class={styles.li}><a class={styles.a} href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
        </ul>
      </div>
    );
  },
};

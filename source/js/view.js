import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

import App from '../vue/App.vue';

new Vue({
  el: "#app",
  render: h => h(App)
})

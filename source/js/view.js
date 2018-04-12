import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

import View from '../vue/View.vue';

new Vue({
  el: "#app",
  render: h => h(View)
})

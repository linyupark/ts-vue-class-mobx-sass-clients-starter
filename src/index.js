
import Vue from 'vue';
import App from './app';
import { router } from '@config/router';
import AppGlobal from '@config/global';
import '@lib/rem';

// 全局数据注入
Vue.prototype.$App = AppGlobal;

new Vue({
  el: '#app',
  router,
  render: h => h(App)
});

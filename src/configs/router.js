import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);


/**
 * 定义通用路由
 */
let router = new Router({
  routes: [
    {
      // 首页
      path: '/',
      name: 'homepage',
      component: () => import('@page/homepage/index.vue')
    }
  ]
});

/**
 * 动态插入客户特殊路由
 */
(async () => {
  const clientRoutes = await import(`@config/clients/router.${__CLIENT__}`);
  router.addRoutes(clientRoutes.default);
})();

/**
 * 拦截
 */
router.beforeEach((to, from, next) => {
  // 自动回滚顶部
  window.scrollTo(0, 0);
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export { router };

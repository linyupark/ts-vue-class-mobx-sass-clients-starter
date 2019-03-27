### 资源目录注意点
* webpack 中会自动在每个组件上载入 themes/__CLIENT__/styles/var.scss 的变量，因此可以不用在组件内的样式中再次引入
* 新皮肤如果变量跟默认的区别不大可先引入老的 var.scss 再后面追加
* common目录放置所有皮肤共享资源
* iconfont 推荐开发时先载入线上 url，等确认出包再放入本地
<template>
  <div id="app">
    <!-- 全局toast -->
    <Toast ref="toast" />
    <!-- 全局modal -->
    <Modal ref="modal" />
    <RouterTransition type="slide">
      <router-view></router-view>
    </RouterTransition>
  </div>
</template>


<script>
  import Vue from "vue";
  import Component from "vue-class-component";
  import Toast from "@module/toast";
  import Modal from "@module/modal";
  import RouterTransition from "@module/router-transition";

  @Component({
    components: {
      RouterTransition,
      Toast,
      Modal,
    }
  })
  export default class App extends Vue {

    async beforeMount() {
      /**
       * 动态引入匹配皮肤全局样式
       */
      await import(`@assets/themes/${__CLIENT__}/app.scss`);
    }

    mounted() {
      // 全局注入关联组件
      this.$App.refs = this.$refs;
    }
  }
</script>

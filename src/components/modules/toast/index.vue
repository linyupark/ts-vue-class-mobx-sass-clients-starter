<template>
  <!-- 轻提示 -->
  <transition :name="transition">
    <div v-if="message" class="toast" @touchstart="prevent">
      <div :class="{[type]: true}">
        <div class="message">
          {{message}}
        </div>
      </div>
    </div>
  </transition>
</template>
<style lang="scss" src="./assets/style" scoped></style>
<script>
  import Vue from 'vue';
  import Component from 'vue-class-component';
  @Component({
    props: {
      // 过渡动画可设置，默认是淡入淡出
      transition: {
        type: String,
        default: 'fade'
      }
    },
  })
  export default class ModuleToast extends Vue {
    // 显示信息，为空的时候则消失
    message = '';

    // 展示类型
    type = '';

    /**
     * @param {String} message 显示内容
     * @param {Object} params { duration, afterClose }
     */
    info(message, params = {}) {
      params = {
        duration: 2000,
        afterClose: () => {},
        ...params
      }
      this.type = 'info';
      this.message = message;
      if (params.duration > 0) {
        setTimeout(() => {
          this.message = '';
          params.afterClose();
        }, params.duration);
      }
    }

    /**
     * 强制关闭
     */
    close() {
      this.message = '';
    }

    // 阻止滑动
    prevent($event) {
      $event.preventDefault();
    }

    mounted() {}
  }
</script>



<template>
  <!-- 弹窗提示 -->
  <transition :name="transition">
    <div
      v-if="visible"
      class="modal"
    >
      <div
        class="container"
        :class="{[type]: true}"
      >
        <div class="wrapper">
          <div class="title">{{ title }}</div>
          <div
            class="content"
            v-html="content"
          ></div>
        </div>
        <div class="btns">
          <button
            v-for="(btn, i) in btns"
            :key="i"
            :class="{[btn.className]: true}"
            @click="btn.onClick"
          >{{ btn.text }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>
<style lang="scss" src="./assets/style" scoped></style>
<script>
  import Vue from "vue";
  import Component from "vue-class-component";
  @Component({
    props: {
      // 过渡动画可设置，默认是淡入淡出
      transition: {
        type: String,
        default: "fade"
      }
    }
  })
  export default class ModuleModal extends Vue {
    // 类型
    type = "";

    // 显示开关
    visible = false;

    // 标题
    title = "";

    // 正文
    content = "";

    // 按钮组
    btns = [];

    /**
     * 确认对话框
     * @param {String} content 确认信息
     * @param {Object} params
     * okText?: string;
     * onOk?: function;
     * cancelText?: string;
     * onCancel?: function;
     */
    confirm(content, params = {}) {
      let data = {
        type: "confirm",
        content,
        okText: "确定",
        cancelText: "取消",
        onOk: () => {},
        cancelClass: "cancel",
        onCancel: () => {},
        ...params
      };
      this.show(data);
    }

    /**
     * 提示
     * @param {String} content 信息
     * @param {Object} params
     * okText?: string;
     * onOk?: function;
     */
    alert(content, params = {}) {
      let data = {
        type: "alert",
        content,
        okText: "确定",
        onOk: () => {},
        ...params
      };
      this.show(data);
    }

    /**
     * 长文字展示 支持html格式展示
     */
    html(html, params = {}) {
      let data = {
        type: "html",
        content: html.replace(/width=\"\d+\"/g, '').replace(/style=\"[^\"]+\"/g, ''),
        okText: "关闭",
        onOk: () => {},
        ...params
      };
      this.show(data);
    }

    /**
     * 统一展示内部方法
     */
    show(data) {
      this.type = data.type;
      this.visible = true;
      this.title = data.title || "";
      this.content = data.content || "";
      if (data.type === "alert" || data.type === "html") {
        this.btns = [
          {
            text: data.okText,
            className: "ok",
            onClick: () => {
              data.onOk();
              this.visible = false;
            }
          }
        ];
      }
      if (data.type === "confirm") {
        this.btns = [
          {
            text: data.cancelText,
            className: data.cancelClass,
            onClick: () => {
              data.onCancel();
              this.visible = false;
            }
          },
          {
            text: data.okText,
            className: "ok",
            onClick: () => {
              data.onOk();
              this.visible = false;
            }
          }
        ];
      }
    }

    mounted() {
      let scrollTop;
      this.$watch("visible", visible => {
        if (visible) {
          scrollTop = document.scrollingElement.scrollTop;
          document.body.classList.add("no-scroll");
          document.body.style.top = -scrollTop + "px";
        } else {
          document.body.classList.remove("no-scroll");
          document.scrollingElement.scrollTop = scrollTop;
        }
      });
    }
  }
</script>



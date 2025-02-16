<script setup>
import { ref } from 'vue'

// 输入框的值，使用 ref 实现响应式
const inputValue = ref('')

// 定义组件的 props，接收 loading 状态
const props = defineProps({
  loading: {
    type: Boolean, // loading 的类型为布尔值
    default: false, // 默认值为 false
  },
})

// 定义组件的事件，这里声明了一个 send 事件
const emit = defineEmits(['send'])

// 处理发送消息的方法
const handleSend = () => {
  // 如果消息为空或正在加载中，则不发送
  if (!inputValue.value.trim() || props.loading) return

  // 触发 send 事件，将消息内容作为参数传递
  emit('send', inputValue.value)
  // 清空输入框
  inputValue.value = ''
}

// 处理换行的方法（Shift + Enter）
const handleNewline = (e) => {
  e.preventDefault() // 阻止默认的 Enter 发送行为
  inputValue.value += '\n' // 在当前位置添加换行符
}
</script>

<template>
  <div class="chat-input-wrapper">
    <el-input
      v-model="inputValue"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 6 }"
      placeholder="输入消息，Enter 发送，Shift + Enter 换行"
      resize="none"
      @keydown.enter.exact.prevent="handleSend"
      @keydown.enter.shift="handleNewline"
    />
    <div class="button-group">
      <button class="action-btn">
        <img src="@/assets/photo/附件.png" alt="link" />
      </button>
      <button class="action-btn">
        <img src="@/assets/photo/图片.png" alt="picture" />
      </button>
      <div class="divider"></div>
      <button class="action-btn send-btn" :disabled="props.loading" @click="handleSend">
        <img src="@/assets/photo/发送.png" alt="send" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-input-wrapper {
  padding: 0.8rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 自定义输入框样式 */
  :deep(.el-textarea__inner) {
    border-radius: 8px;
    resize: none;
    border: none;
    box-shadow: none;

    &:focus {
      border: none;
      box-shadow: none;
    }
  }

  /* 按钮组容器样式 */
  .button-group {
    display: flex; /* 使用弹性布局 */
    justify-content: flex-end; /* 按钮靠右对齐 */
    margin-top: 0.25rem; /* 与输入框的上方间距 */
    gap: 0.5rem; /* 按钮之间的间距 */
    align-items: center; /* 垂直居中对齐，让分隔线居中 */

    /* 分隔线样式 */
    .divider {
      height: 1rem; /* 分隔线高度16px */
      width: 1px; /* 分隔线宽度1px */
      background-color: var(--border-color); /* 使用主题变量设置颜色 */
      margin: 0; /* 重置所有边距 */
      margin-left: 0.125rem; /* 左边距2px */
      margin-right: 0.25rem; /* 右边距4px */
    }

    /* 通用按钮样式 */
    .action-btn {
      width: 1.75rem; /* 默认按钮宽度28px */
      height: 1.75rem; /* 默认按钮高度28px */
      border: none; /* 移除边框 */
      background: none; /* 移除背景色 */
      padding: 0; /* 移除内边距 */
      cursor: pointer; /* 鼠标悬停时显示手型 */
      border-radius: 50%; /* 圆形按钮 */
      display: flex; /* 使用弹性布局使图标居中 */
      align-items: center; /* 垂直居中 */
      justify-content: center; /* 水平居中 */
      transition: background-color 0.3s; /* 背景色过渡动画 */

      /* 按钮内图标样式 */
      img {
        width: 1rem; /* 默认图标宽度16px */
        height: 1rem; /* 默认图标高度16px */
      }

      /* 按钮悬停效果 */
      &:hover {
        background-color: rgba(0, 0, 0, 0.05); /* 悬停时显示浅灰色背景 */
      }

      /* 发送按钮特殊样式 */
      &.send-btn {
        width: 2rem; /* 发送按钮宽度32px */
        height: 2rem; /* 发送按钮高度32px */
        background-color: #3f7af1; /* 蓝色背景 */

        img {
          width: 1.25rem; /* 发送按钮图标宽度20px */
          height: 1.25rem; /* 发送按钮图标高度20px */
        }

        &:hover {
          background-color: #3266d6; /* 悬停时加深背景色 */
        }
      }
    }
  }
}
</style>

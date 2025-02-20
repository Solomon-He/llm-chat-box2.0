<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import DialogEdit from '@/components/DialogEdit.vue'

const isVisible = ref(false)
const chatStore = useChatStore()
const dialogEdit = ref(null)

// 处理点击事件
const handleClickOutside = (event) => {
  const wrapper = document.querySelector('.popup-wrapper')
  // 如果点击的位置不在弹出框内部，则关闭弹出框
  if (wrapper && !wrapper.contains(event.target)) {
    isVisible.value = false
  }
}

// 组件挂载时添加点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除点击事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggle = () => {
  isVisible.value = !isVisible.value
}

// 创建新对话
const handleNewChat = () => {
  chatStore.createConversation()
  isVisible.value = false
}

// 切换对话
const handleSwitchChat = (conversationId) => {
  chatStore.switchConversation(conversationId)
  isVisible.value = false
}

// 格式化标题
const formatTitle = (title) => {
  return title.length > 4 ? title.slice(0, 4) + '...' : title
}

// 导出方法供父组件调用
defineExpose({
  toggle,
})
</script>

<template>
  <div class="popup-wrapper">
    <button class="action-btn" @click="toggle">
      <img src="@/assets/photo/弹出框.png" alt="" />
    </button>
    <!-- 弹出框 -->
    <Transition
      enter-active-class="animate__animated animate__fadeInLeft"
      leave-active-class="animate__animated animate__fadeOutLeft"
    >
      <div class="popup-menu" v-show="isVisible">
        <div class="menu-section">
          <el-button class="new-chat-btn" :icon="Plus" @click="handleNewChat">新对话</el-button>
        </div>
        <div class="divider"></div>
        <div class="menu-section">
          <div class="section-title">历史对话</div>
          <div class="history-list">
            <div
              v-for="conversation in chatStore.conversations"
              :key="conversation.id"
              class="menu-item"
              :class="{ active: conversation.id === chatStore.currentConversationId }"
              @click="handleSwitchChat(conversation.id)"
            >
              <div class="item-content">
                <img src="@/assets/photo/对话.png" alt="" />
                <span :title="conversation.title">{{ formatTitle(conversation.title) }}</span>
              </div>
              <div class="item-actions">
                <button
                  class="action-btn"
                  @click.stop="dialogEdit.openDialog(conversation.id, 'edit')"
                >
                  <img src="@/assets/photo/编辑.png" alt="edit" />
                </button>
                <button
                  class="action-btn"
                  @click.stop="dialogEdit.openDialog(conversation.id, 'delete')"
                >
                  <img src="@/assets/photo/删除.png" alt="delete" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 添加对话框组件 -->
    <DialogEdit ref="dialogEdit" />
  </div>
</template>

<style lang="scss" scoped>
.popup-wrapper {
  position: relative;

  .action-btn {
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    img {
      width: 1.4rem;
      height: 1.4rem;
      opacity: 1;
      transition: filter 0.2s;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }
}

.popup-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 200px;
  background: #f7f7f7;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  padding: 0.5rem 0;
  margin-top: 0;
  animation-duration: 0.3s !important;

  .menu-section {
    padding: 0.5rem 0;

    .section-title {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 500;
    }

    .menu-item {
      display: flex; /* 使用 flex 布局 */
      align-items: center; /* 垂直居中对齐 */
      justify-content: space-between; /* 两端对齐，中间留空 */
      padding: 0.5rem 1rem; /* 内边距：上下 8px，左右 16px */
      cursor: pointer; /* 鼠标指针样式为手型 */
      transition: background-color 0.2s; /* 背景色过渡动画 */

      /* 左侧内容区域样式 */
      .item-content {
        display: flex; /* 使用 flex 布局 */
        align-items: center; /* 垂直居中对齐 */
        gap: 0.5rem; /* 元素间距 8px */

        /* 对话图标样式 */
        img {
          width: 1rem; /* 图标宽度 16px */
          height: 1rem; /* 图标高度 16px */
        }

        /* 对话标题文本样式 */
        span {
          font-size: 0.875rem; /* 文字大小 14px */
          color: #374151; /* 文字颜色：深灰色 */
        }
      }

      /* 右侧操作按钮区域样式 */
      .item-actions {
        display: flex; /* 使用 flex 布局 */
        gap: 0.4rem; /* 按钮间距 4px */
        opacity: 0; /* 默认隐藏 */
        transition: opacity 0.2s ease; /* 透明度过渡动画 */

        /* 操作按钮样式 */
        .action-btn {
          width: 0.9rem; /* 按钮宽度 16px */
          height: 0.9rem; /* 按钮高度 16px */
          padding: 0; /* 移除内边距 */
          border: none; /* 移除边框 */
          background: none; /* 移除背景色 */
          cursor: pointer; /* 鼠标指针样式为手型 */
          display: flex; /* 使用 flex 布局 */
          align-items: center; /* 垂直居中对齐 */
          justify-content: center; /* 水平居中对齐 */
          opacity: 1; /* 默认透明度 */
          transition: filter 0.2s;

          /* 按钮图标样式 */
          img {
            width: 100%; /* 图标占满按钮宽度 */
            height: 100%; /* 图标占满按钮高度 */
          }

          /* 按钮悬停效果 */
          &:hover {
            filter: brightness(0.4); /* 使用 brightness 滤镜来加深颜色 */
          }
        }
      }

      /* 菜单项悬停和选中状态 */
      &:hover,
      &.active {
        background-color: #e5e7eb; /* 背景色：浅灰色 */

        /* 显示操作按钮 */
        .item-actions {
          opacity: 0.7;
        }
      }

      /* 当前选中项的特殊样式 */
      &.active {
        background-color: #e5e7eb; /* 背景色：浅灰色 */
        position: relative; /* 相对定位，用于放置指示条 */

        /* 左侧蓝色指示条 */
        &::before {
          content: ''; /* 伪元素内容 */
          position: absolute; /* 绝对定位 */
          left: 0; /* 靠左对齐 */
          top: 0; /* 靠上对齐 */
          bottom: 0; /* 延伸到底部 */
          width: 3px; /* 指示条宽度 */
          background-color: #3f7af1; /* 指示条颜色：蓝色 */
          border-radius: 0 2px 2px 0; /* 右侧圆角 */
        }

        /* 选中项的文本样式 */
        span {
          color: #3f7af1; /* 文字颜色：蓝色 */
          font-weight: 500; /* 字重：中等 */
        }
      }
    }

    .new-chat-btn {
      width: 100%;
      justify-content: flex-start;
      border: none;
      background: none;
      height: 2.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      color: #374151;

      &:hover {
        background-color: #e5e7eb;
      }

      :deep(.el-icon) {
        margin-right: 0.5rem;
        font-size: 1rem;
      }
    }
  }

  .divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 0.25rem 0;
  }
}
</style>

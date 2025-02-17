<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'

const isVisible = ref(false)
const chatStore = useChatStore()

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
              <img src="@/assets/photo/对话.png" alt="" />
              <span>{{ conversation.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      img {
        width: 1rem;
        height: 1rem;
      }

      span {
        font-size: 0.875rem;
        color: #374151;
      }

      &:hover {
        background-color: #e5e7eb;
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

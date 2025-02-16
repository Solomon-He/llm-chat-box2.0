<script setup>
import ChatInput from '@/components/ChatInput.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { Setting, Plus } from '@element-plus/icons-vue'
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { messageHandler } from '@/utils/messageHandler'
import { createChatCompletion } from '@/utils/api'
import { useSettingStore } from '@/stores/setting'
import SettingsPanel from '@/components/SettingsPanel.vue'

// 获取聊天消息
const chatStore = useChatStore()
const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const settingStore = useSettingStore()

// 获取消息容器
const messagesContainer = ref(null)
// 监听消息变化，滚动到底部
watch(
  messages,
  () => {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  },
  { deep: true },
)

// 每次页面刷新时，将消息容器滚动到底部
onMounted(() => {
  nextTick(() => {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
})

// 发送消息
const handleSend = async (content) => {
  try {
    // 添加用户消息
    chatStore.addMessage(messageHandler.formatMessage('user', content))
    chatStore.addMessage(messageHandler.formatMessage('assistant', ''))

    // 设置loading状态
    chatStore.setIsLoading(true)
    const lastMessage = chatStore.getLastMessage()
    lastMessage.loading = true

    // 调用API获取回复
    const messages = chatStore.messages.map(({ role, content }) => ({ role, content }))
    const response = await createChatCompletion(messages)

    if (settingStore.settings.stream) {
      console.log('流式响应')
      // 处理流式响应
      const reader = response.body.getReader() // 获取流式响应的reader对象
      const decoder = new TextDecoder() // 创建文本解码器
      let accumulatedContent = '' // 累积的内容
      let startTime = Date.now() // 记录开始时间

      while (true) {
        // 读取流式响应的值
        const { done, value } = await reader.read()
        // 如果读取完成，则退出循环
        if (done) break

        // 解码流式响应的值
        const chunk = decoder.decode(value)
        // 分割成行，并过滤空行
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        // 遍历行
        for (const line of lines) {
          // 如果行是DONE，则跳过
          if (line === 'data: [DONE]') continue
          // 如果行以data:开头，则解析JSON
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5))
            const content = data.choices[0].delta.content || ''
            accumulatedContent += content

            // 更新消息内容
            chatStore.updateLastMessage(
              accumulatedContent,
              data.usage?.completion_tokens || 0,
              ((data.usage?.completion_tokens || 0) / ((Date.now() - startTime) / 1000)).toFixed(2),
            )
          }
        }
      }
    } else {
      // 非流式响应处理
      chatStore.updateLastMessage(
        response.choices[0].message.content,
        response.usage.completion_tokens,
        response.speed,
      )
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    chatStore.updateLastMessage('抱歉，发生了一些错误，请稍后重试。')
  } finally {
    // 重置loading状态
    chatStore.setIsLoading(false)
    const lastMessage = chatStore.getLastMessage()
    lastMessage.loading = false
  }
}

// 重新生成的处理函数
const handleRegenerate = async () => {
  try {
    // 获取最后一条用户消息
    const lastUserMessage = chatStore.messages[chatStore.messages.length - 2]
    // 使用 splice 删除最后两个元素
    chatStore.messages.splice(-2, 2)
    await handleSend(lastUserMessage.content)
  } catch (error) {
    console.error('Failed to regenerate message:', error)
  }
}

// 添加抽屉引用
const settingDrawer = ref(null)
</script>

<template>
  <!-- 聊天容器 -->
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left">
        <el-button class="new-chat-btn" :icon="Plus">新对话</el-button>
        <div class="divider"></div>
        <h1 class="chat-title">LLM Chat</h1>
      </div>

      <div class="header-right">
        <el-button circle :icon="Setting" @click="settingDrawer.openDrawer()" />
      </div>
    </div>

    <!-- 消息容器，显示对话消息 -->
    <div class="messages-container" ref="messagesContainer">
      <template v-if="messages.length > 0">
        <chat-message
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :is-last-assistant-message="index === messages.length - 1 && message.role === 'assistant'"
          @regenerate="handleRegenerate"
        />
      </template>
      <div v-else class="empty-state">
        <el-empty description="开始对话吧" />
      </div>
    </div>

    <!-- 聊天输入框 -->
    <div class="chat-input-container">
      <chat-input :loading="isLoading" @send="handleSend" />
    </div>

    <!-- 设置面板 -->
    <SettingsPanel ref="settingDrawer" />
  </div>
</template>

<style lang="scss" scoped>
/* 定义聊天容器的样式，占据整个视口高度，使用flex布局以支持列方向的布局 */
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 设置聊天头部的样式，包括对齐方式和背景色等 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--bg-color);
  border-bottom: 1px solid #ffffff;

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;

    .new-chat-btn {
      /* 基础尺寸设置 */
      font-size: 0.8rem;
      height: 2rem;
      padding: 0rem 0.5rem;

      /* 文字垂直居中对齐 */
      display: inline-flex; /* 使用 flex 布局 */
      align-items: center; /* 垂直居中对齐 */
      line-height: 1; /* 重置行高 */

      /* 圆角设置 - 添加胶囊形状 */
      border-radius: 9999px; /* 使用较大的值来确保完全的胶囊形状 */

      /* 未选中状态 */
      border: 1px solid #3f7af1;
      background-color: #ffffff;
      color: #3f7af1;

      /* 鼠标悬停效果 */
      &:hover {
        background-color: #3f7af1;
        border-color: #3f7af1;
        color: #ffffff;
      }

      /* 图标样式 */
      :deep(.el-icon) {
        margin-right: 4px;
        font-size: 0.875rem;
      }
    }

    /* 添加分隔线样式 */
    .divider {
      height: 1.5rem; /* 设置分隔线高度 */
      width: 1px; /* 设置分隔线宽度 */
      background-color: #e5e7eb; /* 设置分隔线颜色 */
      margin: 0 0.2rem; /* 设置左右间距 */
    }

    .chat-title {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-color-primary);
    }
  }

  .header-right {
    display: flex;
    gap: 0.5rem;

    :deep(.el-button) {
      height: 2rem;
      width: 2rem;
    }
  }
}

/* 定义消息容器的样式 */
.messages-container {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 垂直方向可滚动 */
  // padding: 1rem; /* 四周内边距 */
  background-color: var(--bg-color-secondary); /* 使用主题变量设置背景色 */

  /* 设置最大宽度和居中对齐，与输入框保持一致 */
  max-width: 796px; /* 设置最大宽度 */
  margin: 0 auto; /* 水平居中 */
  width: 100%; /* 在最大宽度范围内占满宽度 */

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px; /* 滚动条宽度 */
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd; /* 滚动条滑块颜色 */
    border-radius: 3px; /* 滚动条滑块圆角 */
  }

  &::-webkit-scrollbar-track {
    background-color: transparent; /* 滚动条轨道透明 */
  }
}

/* 设置空状态时的样式，占据全部高度，居中对齐内容 */
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 添加输入框容器样式 */
.chat-input-container {
  position: sticky; /* 使用粘性定位，当滚动到底部时固定位置 */
  bottom: 0; /* 固定在底部 */
  left: 0; /* 左边缘对齐 */
  right: 0; /* 右边缘对齐 */
  background-color: var(--bg-color); /* 使用主题变量设置背景色 */
  z-index: 10; /* 设置层级，确保输入框始终显示在其他内容之上 */
  padding: 1rem; /* 添加内边距，让输入框与边缘保持距离 */
  // padding-top: 0; /* 移除顶部内边距，只保留底部和左右的间距 */

  /* 添加最大宽度和居中对齐 */
  max-width: 796px; /* 设置最大宽度 */
  margin: 0 auto; /* 水平居中 */
  width: 100%; /* 在最大宽度范围内占满宽度 */
}
</style>

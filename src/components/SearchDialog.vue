<script setup>
import { ref, watch, nextTick } from 'vue'
import ChatMessage from './ChatMessage.vue'
import { messageHandler } from '@/utils/messageHandler'
import { createChatCompletion } from '@/utils/api'
import { useSettingStore } from '@/stores/setting'

const searchText = ref('')
const messages = ref([])
const isLoading = ref(false)
const settingStore = useSettingStore()

// 模拟一个初始的 AI 消息
const aiMessage = "Hi, I'm an AI assistant trained on documentation and other content."

// 模拟建议的提示词
const suggestedPrompts = [
  'What is Vercel?',
  'How can I use Next.js on Vercel?',
  'How can I use the Vercel AI SDK?',
  'Can you explain the Vercel Pro plan?',
]

// 获取消息容器
const messagesContainer = ref(null)

// 监听消息变化，滚动到底部
watch(
  messages,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  },
  { deep: true },
)

// 处理发送消息
const handleSend = async () => {
  if (!searchText.value.trim() || isLoading.value) return

  try {
    // 设置loading状态
    isLoading.value = true

    // 添加用户消息
    messages.value.push(messageHandler.formatMessage('user', searchText.value.trim()))
    messages.value.push(messageHandler.formatMessage('assistant', ''))

    // 获取最后一条消息
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.loading = true

    // 调用API获取回复
    const messagesForAPI = messages.value.map(({ role, content }) => ({ role, content }))
    const response = await createChatCompletion(messagesForAPI)

    // 使用封装的响应处理函数
    await messageHandler.handleResponse(
      response,
      settingStore.settings.stream,
      (content, tokens, speed) => {
        lastMessage.content = content
        lastMessage.completion_tokens = tokens
        lastMessage.speed = speed
      },
    )

    // 清空输入框
    searchText.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.content = '抱歉，发生了一些错误，请稍后重试。'
  } finally {
    // 重置loading状态
    isLoading.value = false
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.loading = false
  }
}

// 处理重新生成
const handleRegenerate = async () => {
  try {
    // 获取最后一条用户消息
    const lastUserMessage = messages.value[messages.value.length - 2]
    // 删除最后两条消息（用户消息和AI回复）
    messages.value.splice(-2, 2)
    // 重新发送最后一条用户消息，但使用新的 id
    // searchText.value = lastUserMessage.content
    // 确保消息有新的 id
    const newUserMessage = {
      ...messageHandler.formatMessage('user', lastUserMessage.content),
      id: Date.now(),
    }
    messages.value.push(newUserMessage)
    messages.value.push({
      ...messageHandler.formatMessage('assistant', ''),
      id: Date.now() + 1,
    })

    // 获取最后一条消息
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.loading = true

    // 调用API获取回复
    const messagesForAPI = messages.value.map(({ role, content }) => ({ role, content }))
    const response = await createChatCompletion(messagesForAPI)

    // 使用封装的响应处理函数
    await messageHandler.handleResponse(
      response,
      settingStore.settings.stream,
      (content, tokens, speed) => {
        lastMessage.content = content
        lastMessage.completion_tokens = tokens
        lastMessage.speed = speed
      },
    )
  } catch (error) {
    console.error('Failed to regenerate message:', error)
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.content = '抱歉，发生了一些错误，请稍后重试。'
  } finally {
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.loading = false
  }
}
</script>

<template>
  <div class="search-dialog">
    <div class="search-header">
      <div class="search-input">
        <input
          type="text"
          v-model="searchText"
          placeholder="提问"
          autofocus
          @keydown.enter.prevent="handleSend"
        />
        <button class="action-btn" @click="handleSend" :disabled="isLoading">
          <img src="@/assets/photo/回车.png" alt="enter" />
        </button>
      </div>
    </div>

    <!-- 对话内容部分 -->
    <div class="dialog-content" ref="messagesContainer">
      <template v-if="messages.length === 0">
        <!-- 初始 AI 消息 -->
        <div class="initial-message">
          {{ aiMessage }}
        </div>

        <!-- 建议提示词 -->
        <div class="suggested-prompts">
          <div class="prompt-title">建议提示词</div>
          <div class="prompt-list">
            <button
              v-for="prompt in suggestedPrompts"
              :key="prompt"
              class="prompt-item"
              @click="searchText = prompt"
            >
              {{ prompt }}
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <!-- 对话消息列表 -->
        <ChatMessage
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :is-last-assistant-message="index === messages.length - 1 && message.role === 'assistant'"
          @regenerate="handleRegenerate"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-dialog {
  width: 640px; // 设置对话框宽度
  background: #fff; // 设置白色背景
  border-radius: 8px; // 设置圆角
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // 添加阴影效果
  overflow: hidden; // 隐藏溢出内容
  display: flex; // 使用弹性布局
  flex-direction: column; // 垂直排列

  .search-header {
    padding: 16px; // 设置内边距
    border-bottom: 1px solid #eaeaea; // 添加底部边框
    display: flex; // 使用弹性布局
    align-items: center; // 垂直居中

    .search-input {
      width: 100%; // 宽度占满容器
      height: 40px; // 设置固定高度
      padding: 0 12px; // 左右内边距
      display: flex; // 使用弹性布局
      align-items: center; // 垂直居中
      position: relative; // 为按钮定位提供参考

      input {
        width: 100%; // 输入框占满容器宽度
        height: 100%; // 输入框占满容器高度
        border: none; // 移除边框
        outline: none; // 移除轮廓
        background: none; // 移除背景
        font-size: 1rem; // 设置字体大小
        color: #000; // 设置文字颜色
        padding-right: 40px; // 为按钮留出空间

        &::placeholder {
          color: #999; // 设置占位符颜色
        }
      }

      .action-btn {
        position: absolute; // 绝对定位
        right: 8px; // 距右侧8px
        top: 50%; // 垂直居中
        transform: translateY(-50%); // 垂直居中调整
        width: 28px; // 增加按钮宽度
        height: 28px; // 增加按钮高度
        border: none; // 移除边框
        background: none; // 移除背景
        padding: 0; // 移除内边距
        cursor: pointer; // 鼠标指针
        border-radius: 6px; // 改为正方形圆角
        display: flex; // 弹性布局
        align-items: center; // 垂直居中
        justify-content: center; // 水平居中
        transition: background-color 0.3s; // 过渡动画

        img {
          width: 16px; // 图标宽度
          height: 16px; // 图标高度
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.05); // 悬停效果
        }
      }
    }
  }

  .dialog-content {
    padding: 16px; // 设置内边距
    max-height: 480px; // 设置最大高度
    overflow-y: auto; // 允许垂直滚动
    display: flex; // 使用弹性布局
    flex-direction: column; // 垂直排列
    gap: 16px; // 子元素间距

    .initial-message {
      padding: 16px 12px; // 设置内边距
      color: #000; // 设置文字颜色
      font-size: 14px; // 设置字体大小
      line-height: 1.5; // 设置行高
      display: flex; // 使用弹性布局
      align-items: center; // 垂直居中
    }

    .suggested-prompts {
      margin-top: 24px; // 与上方元素的间距
      display: flex; // 使用弹性布局
      flex-direction: column; // 垂直排列
      gap: 12px; // 子元素间距

      .prompt-title {
        padding-left: 12px;
        font-size: 12px; // 标题字体大小
        color: #666; // 标题颜色
      }

      .prompt-list {
        display: flex; // 使用弹性布局
        flex-direction: column; // 垂直排列
        gap: 8px; // 项目间距

        .prompt-item {
          text-align: left; // 文字左对齐
          padding: 8px 12px; // 内边距
          background: none; // 移除背景
          border: none; // 移除边框
          border-radius: 6px; // 设置圆角
          font-size: 14px; // 设置字体大小
          color: #000; // 设置文字颜色
          cursor: pointer; // 鼠标指针样式
          transition: background-color 0.2s; // 背景色过渡动画
          display: flex; // 使用弹性布局
          align-items: center; // 垂直居中

          &:hover {
            background-color: #f5f5f5; // 悬停时的背景色
          }
        }
      }
    }
  }
}
</style>

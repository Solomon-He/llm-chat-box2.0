<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { renderMarkdown } from '@/utils/markdown'
// 导入图片资源
import copyIcon from '@/assets/photo/复制.png'
import successIcon from '@/assets/photo/成功.png'
import likeIcon from '@/assets/photo/赞.png'
import likeActiveIcon from '@/assets/photo/赞2.png'
import dislikeIcon from '@/assets/photo/踩.png'
import dislikeActiveIcon from '@/assets/photo/踩2.png'
import regenerateIcon from '@/assets/photo/重新生成.png'

// 定义props
const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isLastAssistantMessage: {
    type: Boolean,
    default: false,
  },
})

// 点赞和踩的状态
const isLiked = ref(false)
const isDisliked = ref(false)

// 添加复制状态
const isCopied = ref(false)

// 添加重新生成的事件
const emit = defineEmits(['regenerate'])

// 处理复制函数
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    isCopied.value = true

    // 1.5秒后恢复原始图标
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 处理点赞
const handleLike = () => {
  if (isDisliked.value) isDisliked.value = false
  isLiked.value = !isLiked.value
}

// 处理踩
const handleDislike = () => {
  if (isLiked.value) isLiked.value = false
  isDisliked.value = !isDisliked.value
}

// 添加重新生成的事件
const handleRegenerate = () => {
  emit('regenerate')
}

// 处理代码块的复制
const handleCodeCopy = async (event) => {
  const codeBlock = event.target.closest('.code-block')
  const code = codeBlock.querySelector('code').textContent

  try {
    await navigator.clipboard.writeText(code)
    // 可以添加复制成功的提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 处理代码块主题切换
const handleThemeToggle = (event) => {
  // 确保我们获取到正确的元素
  const codeBlock = event.target.closest('.code-block')
  // 修改获取图标元素的方式
  const themeBtn = event.target.closest('[data-action="theme"]')
  const themeIcon = themeBtn.querySelector('img')
  const lightIcon = themeIcon.dataset.lightIcon
  const darkIcon = themeIcon.dataset.darkIcon

  // 添加调试日志
  // console.log('切换主题', {
  //   codeBlock,
  //   themeIcon,
  //   lightIcon,
  //   darkIcon,
  //   isDark: codeBlock.classList.contains('dark-theme'),
  // })

  codeBlock.classList.toggle('dark-theme')

  // 切换图标
  themeIcon.src = codeBlock.classList.contains('dark-theme') ? lightIcon : darkIcon
}

// 修改事件监听的方式
onMounted(() => {
  // 使用 MutationObserver 来监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        const codeBlocks = document.querySelectorAll('.code-block')
        codeBlocks.forEach((block) => {
          const copyBtn = block.querySelector('[data-action="copy"]')
          const themeBtn = block.querySelector('[data-action="theme"]')

          if (copyBtn && !copyBtn._hasListener) {
            copyBtn.addEventListener('click', handleCodeCopy)
            copyBtn._hasListener = true
          }
          if (themeBtn && !themeBtn._hasListener) {
            themeBtn.addEventListener('click', handleThemeToggle)
            themeBtn._hasListener = true
            // console.log('添加主题切换监听器', { block, themeBtn })
          }
        })
      }
    })
  })

  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // 组件卸载时清理
  onUnmounted(() => {
    observer.disconnect()
    const codeBlocks = document.querySelectorAll('.code-block')
    codeBlocks.forEach((block) => {
      const copyBtn = block.querySelector('[data-action="copy"]')
      const themeBtn = block.querySelector('[data-action="theme"]')

      copyBtn?.removeEventListener('click', handleCodeCopy)
      themeBtn?.removeEventListener('click', handleThemeToggle)
    })
  })
})

// 将消息内容转换为 HTML
const renderedContent = computed(() => {
  return renderMarkdown(props.message.content)
})
</script>

<template>
  <div class="message-item" :class="{ 'is-mine': message.role === 'user' }">
    <div class="content">
      <div class="bubble markdown-body" v-html="renderedContent"></div>
      <!-- 只在 AI 助手消息中显示操作按钮和 tokens 信息 -->
      <div v-if="message.role === 'assistant' && message.loading === false" class="message-actions">
        <button
          v-if="isLastAssistantMessage"
          class="action-btn"
          @click="handleRegenerate"
          data-tooltip="重新生成"
        >
          <img :src="regenerateIcon" alt="regenerate" />
        </button>
        <button class="action-btn" @click="handleCopy" data-tooltip="复制">
          <img :src="isCopied ? successIcon : copyIcon" alt="copy" />
        </button>
        <button class="action-btn" @click="handleLike" data-tooltip="喜欢">
          <img :src="isLiked ? likeActiveIcon : likeIcon" alt="like" />
        </button>
        <button class="action-btn" @click="handleDislike" data-tooltip="不喜欢">
          <img :src="isDisliked ? dislikeActiveIcon : dislikeIcon" alt="dislike" />
        </button>

        <!-- 添加 tokens 信息 -->
        <span v-if="message.completion_tokens" class="tokens-info">
          tokens: {{ message.completion_tokens }}, speed: {{ message.speed }} tokens/s
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-item {
  display: flex; /* 使用弹性布局 */
  margin-bottom: 2rem; /* 消息之间的垂直间距 */

  &.is-mine {
    justify-content: flex-end; /* 用户消息靠右对齐 */

    .content .bubble.markdown-body {
      background-color: #f4f4f4; /* 用户消息背景色 */

      /* 用户消息中的代码块样式 */
      :deep(pre) {
        background-color: var(--code-block-bg);
        border: 1px solid var(--code-border); /* 代码块边框 */
      }

      /* 用户消息中的行内代码样式 */
      :deep(code) {
        background-color: #f0f0f0;
        font-size: 0.875rem; /* 保持代码字体大小为14px */
      }

      /* 用户消息中的引用块样式 */
      :deep(blockquote) {
        border-left-color: var(--border-color);
        color: var(--text-color-secondary);
      }

      /* 用户消息中的链接样式 */
      :deep(a) {
        color: #3f7af1;
        text-decoration: none;

        &:hover {
          text-decoration: underline; /* 悬停时显示下划线 */
        }
      }
    }
  }

  .content {
    max-width: 100%; /* 限制消息气泡最大宽度 */

    .bubble.markdown-body {
      display: inline-block; /* 内联块级元素 */
      padding: 0.75rem 1rem; /* 气泡内边距 */
      background-color: #ffffff; /* AI助手消息背景色 */
      border-radius: 1rem; /* 气泡圆角 */
      font-size: 1rem; /* 普通文字大小16px */
      line-height: 1.5; /* 文字行高 */
      word-break: break-word; /* 长文本自动换行 */

      /* 修改代码块容器样式 */
      :deep(.code-block) {
        margin: 0.5rem 0;
        border: 1px solid var(--code-border);
        border-radius: 0.5rem;
        overflow: hidden;

        /* 移除默认的 pre 边距 */
        > pre {
          margin: 0 !important; /* 使用 !important 覆盖默认样式 */
        }

        /* 代码块头部样式 */
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: var(--code-header-bg);
          // border-bottom: 1px solid var(--code-border);

          .code-lang {
            font-size: 0.875rem;
            color: var(--code-lang-text);
            font-family: var(--code-font-family);
          }

          .code-actions {
            display: flex;
            gap: 0.5rem;

            .code-action-btn {
              width: 1.5rem;
              height: 1.5rem;
              padding: 0;
              border: none;
              background: none;
              cursor: pointer;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              position: relative; /* 为 tooltip 定位做准备 */

              img {
                width: 1rem;
                height: 1rem;
                opacity: 1;
                transition: filter 0.2s;
              }

              &::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                padding: 0.25rem 0.5rem;
                background-color: rgba(0, 0, 0, 0.75);
                color: white;
                font-size: 0.75rem;
                border-radius: 4px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
                margin-bottom: 5px;
                z-index: 10; /* 确保提示框在最上层 */
              }

              &:hover {
                background-color: var(--code-header-button-hover-bg);
                // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              }
            }
          }
        }

        /* 代码块内容样式 */
        pre.hljs {
          margin: 0 !important; /* 确保没有边距 */
          padding: 1rem;
          background-color: var(--code-block-bg);
        }
      }

      // 段落样式
      :deep(p) {
        margin: 0;
        &:not(:last-child) {
          margin-bottom: 0.5rem; // 段落间距
        }
      }

      // 行内代码样式
      :deep(code:not(pre code)) {
        font-family: var(--code-font-family); // 使用等宽字体
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        background-color: #f0f0f0;
      }

      // 列表样式
      :deep(ul),
      :deep(ol) {
        margin: 0.5rem 0;
        padding-left: 1.5rem; // 列表缩进
      }

      // 引用块样式
      :deep(blockquote) {
        margin: 0.5rem 0;
        padding-left: 1rem;
        border-left: 4px solid var(--border-color); // 左侧边框
        color: var(--text-color-secondary); // 使用次要文本颜色
      }

      // 表格样式
      :deep(table) {
        border-collapse: collapse; // 合并边框
        margin: 0.5rem 0;
        width: 100%;

        th,
        td {
          border: 1px solid var(--border-color); // 单元格边框
          padding: 0.5rem;
        }

        th {
          background-color: var(--code-header-bg); // 表头背景色
        }
      }

      // 链接样式
      :deep(a) {
        color: #3f7af1; // 链接颜色
        text-decoration: none;

        &:hover {
          text-decoration: underline; // 悬停时显示下划线
        }
      }

      // 图片样式
      :deep(img) {
        max-width: 100%; // 限制最大宽度
        border-radius: 0.5rem; // 圆角
      }
    }

    // 添加操作按钮容器样式
    .message-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding-left: 1rem;

      .action-btn {
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease; /* 修改过渡效果 */
        position: relative; /* 为 tooltip 定位做准备 */

        img {
          width: 1rem;
          height: 1rem;
          opacity: 1;
          transition: filter 0.2s;
        }

        &::after {
          content: attr(data-tooltip); /* 使用 data-tooltip 替代 title */
          position: absolute;
          bottom: 100%; /* 定位到按钮上方 */
          left: 50%;
          transform: translateX(-50%);
          padding: 0.25rem 0.5rem;
          background-color: rgba(0, 0, 0, 0.75);
          color: white;
          font-size: 0.75rem;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          margin-bottom: 5px; /* 与按钮的间距 */
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

          img {
            filter: brightness(0.4); /* 使用 brightness 滤镜来加深颜色 */
          }
        }

        &:hover::after {
          opacity: 1;
          visibility: visible;
        }

        /* 激活状态的样式 */
        img[src*='2'] {
          filter: none;
        }
      }

      /* 添加 tokens 信息样式 */
      .tokens-info {
        display: flex;
        gap: 0.5rem;
        color: var(--text-color-secondary);
        font-size: 0.75rem;
        background-color: #f3f4f6;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
      }
    }
  }
}
</style>

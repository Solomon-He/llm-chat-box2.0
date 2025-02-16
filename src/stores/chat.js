import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore(
  'llm-chat',
  () => {
    const messages = ref([])
    const isLoading = ref(false)

    const addMessage = (message) => {
      messages.value.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...message,
      })
    }

    const setIsLoading = (value) => {
      isLoading.value = value
    }

    const updateLastMessage = (content, completion_tokens, speed) => {
      if (messages.value.length > 0) {
        const lastMessage = messages.value[messages.value.length - 1]
        lastMessage.content = content
        lastMessage.completion_tokens = completion_tokens
        lastMessage.speed = speed
      }
    }

    const getLastMessage = () => {
      return messages.value[messages.value.length - 1]
    }

    return {
      messages,
      isLoading,
      addMessage,
      setIsLoading,
      updateLastMessage,
      getLastMessage,
    }
  },
  {
    persist: true,
  },
)

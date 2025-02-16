import { useSettingStore } from '@/stores/setting'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'

export const createChatCompletion = async (messages) => {
  const settingStore = useSettingStore()
  const payload = {
    model: settingStore.settings.model,
    messages,
    stream: settingStore.settings.stream,
    max_tokens: settingStore.settings.maxTokens,
    temperature: settingStore.settings.temperature,
    top_p: settingStore.settings.topP,
    top_k: settingStore.settings.topK,
  }

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settingStore.settings.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }

  try {
    const startTime = Date.now() // 记录开始时间
    const response = await fetch(`${API_BASE_URL}/chat/completions`, options)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (settingStore.settings.stream) {
      return response // 直接返回响应对象以支持流式读取
    } else {
      const data = await response.json()
      const duration = (Date.now() - startTime) / 1000 // 使用本地计时
      data.speed = (data.usage.completion_tokens / duration).toFixed(2)
      return data
    }
  } catch (error) {
    console.error('Chat API Error:', error)
    throw error
  }
}

export const messageHandler = {
  formatMessage(role, content) {
    return {
      id: Date.now(),
      role,
      content,
      completion_tokens: 0,
      speed: 0,
      loading: false,
    }
  },
}

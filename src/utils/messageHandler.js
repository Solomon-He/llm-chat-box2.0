export const messageHandler = {
  formatMessage(role, content, files = []) {
    return {
      id: Date.now(),
      role,
      content,
      files,
      completion_tokens: 0,
      speed: 0,
      loading: false,
    }
  },
}

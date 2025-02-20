<script setup>
import { ref } from 'vue'
// import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { WarningFilled } from '@element-plus/icons-vue'

const chatStore = useChatStore()
const dialogVisible = ref(false)
const inputTitle = ref('')
const currentConversationId = ref(null)
const dialogType = ref('edit') // 新增：区分对话框类型（edit/delete）

// 打开对话框
const openDialog = (conversationId, type = 'edit') => {
  currentConversationId.value = conversationId
  dialogType.value = type

  if (type === 'edit') {
    const conversation = chatStore.conversations.find((c) => c.id === conversationId)
    inputTitle.value = conversation?.title || ''
  }

  dialogVisible.value = true
}

// 确认操作
const handleConfirm = () => {
  if (dialogType.value === 'edit') {
    if (!inputTitle.value.trim()) {
      // ElMessage.warning('标题不能为空')
      return
    }
    chatStore.updateConversationTitle(currentConversationId.value, inputTitle.value.trim())
    // ElMessage.success('修改成功')
  } else {
    chatStore.deleteConversation(currentConversationId.value)
    // ElMessage.success('删除成功')
  }
  dialogVisible.value = false
  inputTitle.value = ''
}

// 取消操作
const handleCancel = () => {
  dialogVisible.value = false
  inputTitle.value = ''
}

// 导出方法供父组件调用
defineExpose({
  openDialog,
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogType === 'edit' ? '编辑对话名称' : '确定删除对话?'"
    width="30%"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <!-- 编辑模式显示输入框 -->
    <template v-if="dialogType === 'edit'">
      <el-input v-model="inputTitle" placeholder="请输入对话名称" maxlength="50" />
    </template>
    <!-- 删除模式显示警告文本 -->
    <template v-else>
      <div class="delete-warning">
        <el-icon class="warning-icon"><WarningFilled /></el-icon>
        <span>删除后，聊天记录将不可恢复。</span>
      </div>
    </template>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button :type="dialogType === 'edit' ? 'primary' : 'danger'" @click="handleConfirm">
          {{ dialogType === 'edit' ? '确定' : '删除' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;

  .warning-icon {
    color: #ed3336;
    font-size: 20px;
  }
}
</style>

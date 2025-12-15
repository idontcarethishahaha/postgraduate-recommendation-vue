<script setup lang="ts">
import { render } from 'vue'

const props = defineProps<{
  message: string
  close: () => void
}>()

const handleClose = () => {
  props.close()

  const overlayEl = document.querySelector('.message-overlay')
  if (overlayEl) {
    render(null, overlayEl.parentElement!) //卸载父容器
    overlayEl.remove()
  }
}
</script>

<template>
  <div class="message-overlay">
    <div class="message-dialog">
      <div class="dialog-content">
        <p>{{ message }}</p>
        <button @click="handleClose" class="confirm-btn">确认</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.message-dialog {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 400px;
  padding: 24px;
}
.dialog-content {
  text-align: center;
}
.dialog-content p {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
}
.confirm-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
}
.confirm-btn:hover {
  background-color: #40a9ff;
}
</style>

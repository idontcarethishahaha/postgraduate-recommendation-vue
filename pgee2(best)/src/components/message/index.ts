import { ElNotification } from 'element-plus'
import { defineAsyncComponent, h, render } from 'vue'
// 函数式组件
export const createMessageDialog = (msg: string, close?: () => void) => {
  const node = h(
    defineAsyncComponent(() => import('./ConfirmMessage.vue')),
    { message: msg, close }
  )
  render(node, document.body)
}

export const createElNotificationSuccess = (msg: string) => {
  ElNotification({
    title: 'Success',
    message: msg,
    type: 'success'
  })
}

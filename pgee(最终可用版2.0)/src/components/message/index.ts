import { ElNotification } from 'element-plus' //通知组件
//defineAsyncComponent异步组件加载,懒加载
import { defineAsyncComponent, h, render } from 'vue'

// 函数式组件
export const createMessageDialog = (msg: string, close?: () => void) => {
  const node = h(
    //懒加载，用到时才加载
    defineAsyncComponent(() => import('./ConfirmMessage.vue')),
    { message: msg, close } //向组件传递props：消息文本+关闭回调
  )
  render(node, document.body) //渲染到body
}

export const createElNotificationSuccess = (msg: string) => {
  ElNotification({
    title: 'Success',
    message: msg,
    type: 'success'
  })
}

export const createElNotificationError = (msg: string) => {
  ElNotification({
    title: 'Error',
    message: msg,
    type: 'error'
  })
}

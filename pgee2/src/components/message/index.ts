import { ElNotification } from 'element-plus'
import { defineAsyncComponent, h, render } from 'vue'

//创建消息对话框
export const createMessageDialog = (msg: string, close: () => void = () => {}) => {
  //导入对话框组件
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

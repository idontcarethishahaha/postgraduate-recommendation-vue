import type { Progress } from '@/types' //进度条
import { ElNotification } from 'element-plus' //通知
import { h } from 'vue'
import ProgressVue from './ProgressVue.vue' //进度条组件

//带进度条的全局通知
export const createProgressNotification = (progress: { progress: Progress }) => {
  const notice = ElNotification({
    title: 'Loading...',
    //渲染自定义ProgressVue组件，并传递progress参数
    message: h(ProgressVue, progress),
    type: 'success',
    duration: 0 //不自动关闭
  })

  const close = () => notice.close()
  return { close } //返回close，可手动关闭通知
}

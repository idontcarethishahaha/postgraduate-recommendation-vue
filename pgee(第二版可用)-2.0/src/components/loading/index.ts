import { h, render } from 'vue'
import LoadingVue from './LoadingVue.vue'

// 函数重载
export function createElLoading<T>(pro: Promise<T>): Promise<T>
export function createElLoading(pro?: undefined): { close: () => void }

export function createElLoading<T>(pro?: Promise<T>): Promise<T> | { close: () => void } {
  const container = document.createElement('div') // 用于挂载组件的容器
  const vnode = h(LoadingVue)
  render(vnode, container) // 渲染组件到容器
  document.body.appendChild(container.firstElementChild!) // 将组件添加到页面

  const close = () => {
    render(null, container) // 卸载组件
    if (container.parentNode) {
      container.parentNode.removeChild(container) // 移除容器DOM
    }
  }

  // 如果传入Promise，自动管理关闭
  if (!pro) {
    return { close } // 无Promise时返回手动关闭方法
  }

  // 有Promise时，自动在完成/失败后关闭
  return pro.then(
    result => {
      close()
      return result
    },
    error => {
      close()
      throw error // 继续抛出错误，不中断Promise链
    }
  )
}

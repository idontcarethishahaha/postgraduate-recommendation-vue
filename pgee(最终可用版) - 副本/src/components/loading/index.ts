import { h, render } from 'vue'
//h,创建虚拟节点（VNode）;render，将VNode渲染到真实DOM
import LoadingVue from './LoadingVue.vue'

// 函数重载
//入参为 Promise<T> 时，返回值也是 Promise<T>（和原 Promise 结果一致）
export function createElLoading<T>(pro: Promise<T>): Promise<T>
//入参为空（pro?: undefined）时，返回值是包含 close 方法的对象
export function createElLoading(pro?: undefined): { close: () => void }

export function createElLoading<T>(pro?: Promise<T>): Promise<T> | { close: () => void } {
  const container = document.createElement('div') //组件挂载容器
  const vnode = h(LoadingVue) //创建LoadingVue组件的VNode
  render(vnode, container) //将VNode渲染到容器中
  document.body.appendChild(container.firstElementChild!) // 将组件添加到页面body

  const close = () => {
    render(null, container) // 卸载组件,销毁VNode
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

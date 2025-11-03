import { VueQueryPlugin } from '@tanstack/vue-query' // 新增：导入 TanStack Query
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './axios' // 导入 axios 拦截器配置
import './permission' // 导入路由守卫配置
import router from './router'
import { createMessageDialog } from './utils/message'

const app = createApp(App)
const pinia = createPinia()

// 注册 TanStack Query（新增）
app.use(VueQueryPlugin, {
  defaultOptions: {
    queries: {
      suspense: true, // 开启 Suspense 模式，配合 App.vue 的 Suspense 组件
      staleTime: 5 * 60 * 1000, // 5分钟内缓存有效，不重复请求
      refetchOnWindowFocus: false // 窗口聚焦不重新请求
    }
  }
})

app.use(pinia)
app.use(ElementPlus)
app.use(router)

// 全局错误处理（保持不变）
app.config.errorHandler = (error: unknown) => {
  const message = error instanceof Error ? error.message : '操作失败，请稍后重试'
  createMessageDialog(message)
}

app.mount('#app')

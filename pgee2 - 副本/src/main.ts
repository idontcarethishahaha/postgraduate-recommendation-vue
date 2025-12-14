import { createMessageDialog } from '@/components/message'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import queryClient from './vuequery'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
app.use(VueQueryPlugin, { queryClient })
//悬浮插件
app.use(VueQueryPlugin, {
  enableDevtoolsV6Plugin: true
})
app.use(router)
app.mount('#app')

app.config.errorHandler = err => {
  const error = err as string
  console.error(error)
  createMessageDialog(error)
}

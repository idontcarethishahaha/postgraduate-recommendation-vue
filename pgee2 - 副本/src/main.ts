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
app.use(VueQueryPlugin, {
  queryClient,
  enableDevtoolsV6Plugin: true
})
app.use(router)

app.config.errorHandler = err => {
  const error = err as string
  console.error(error)
  createMessageDialog(error)
}
app.mount('#app')

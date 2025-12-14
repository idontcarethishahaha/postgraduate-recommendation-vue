import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 添加服务器代理配置
  server: {
    proxy: {
      '/api/': {
        target: 'http://localhost:8080', // 后端接口地址
        changeOrigin: true // 允许跨域
      }
    }
  }
})

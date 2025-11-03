import { useUserStore } from '@/stores/user'
import type { LoginRequest, UserInfo } from '@/types'
import axios from 'axios'

export class UserService {
  // 登录请求：直接用 axios，不包 try/catch（异常由拦截器处理）
  static async login(form: LoginRequest): Promise<UserInfo> {
    const response = await axios.post('/user/login', form)
    const { code, data, message } = response.data

    if (code !== 200) {
      throw new Error(message || '登录失败') // 抛错让拦截器处理
    }

    // Service 内部操作 Store，组件不直接碰 Store
    const userStore = useUserStore()
    userStore.setUser(data)
    localStorage.setItem('token', data.token)
    return data
  }

  // 获取用户信息：直接用 axios，不包 try/catch
  static async getUserInfo(): Promise<UserInfo> {
    const response = await axios.get('/user/info')
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '获取用户信息失败')
    }
    return response.data.data
  }

  // 登出：清理状态
  static logout() {
    const userStore = useUserStore()
    userStore.clearUser()
    localStorage.removeItem('token')
  }
}

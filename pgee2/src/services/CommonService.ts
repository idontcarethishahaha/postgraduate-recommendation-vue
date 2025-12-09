import axios from '@/axios'
import router from '@/router'
import { useUserStore } from '@/stores/UserStore'
import { ADMIN } from './Const'

const userStore = useUserStore()

export class CommonService {
  //检查管理员登录状态
  static checkAdminLogin(): boolean {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    console.log('登录状态检查:', {
      token: token ? '存在' : '不存在',
      role
    })

    if (!token) {
      console.log('未找到token,跳转到登录页')
      router.push('/login')
      return false
    }

    if (role !== ADMIN) {
      console.log('角色不符，当前角色:', role, '，期望角色: ' + ADMIN)
      router.push('/login')
      return false
    }

    console.log('登录状态验证通过')
    return true
  }

  //检查登录状态
  static checkLogin(): boolean {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || !role) {
      router.push('/login')
      return false
    }

    return true
  }

  //检查特定角色权限
  static checkRole(allowedRoles: string[]): boolean {
    const role = localStorage.getItem('role')
    if (!role || !allowedRoles.includes(role)) {
      router.push('/login')
      return false
    }
    return true
  }

  // 获取当前用户角色
  static getRole(): string | null {
    return localStorage.getItem('role')
  }

  //退出登录
  static logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    if (userStore) {
      userStore.clearUser()
    }
    router.push('/login')
  }

  //更新密码
  static async updateSelfPassword(password: string): Promise<void> {
    const response = await axios.put('/user/password', { password })
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '密码更新失败')
    }
  }
}

// src/services/CommonService.ts
import { useRouter } from 'vue-router'

export const CommonService = {
  // 获取当前用户角色（从 sessionStorage 读取）
  getRole(): string {
    return sessionStorage.getItem('role') || ''
  },

  // 获取当前用户ID
  getUserId(): string {
    return sessionStorage.getItem('userId') || ''
  },

  // 获取当前用户名
  getUserName(): string {
    return sessionStorage.getItem('userName') || ''
  },

  // 校验用户是否有目标权限
  hasPermission(requiredRoles: string[]): boolean {
    const currentRole = this.getRole()
    return requiredRoles.includes(currentRole)
  },

  // 判断是否已登录
  isLogin(): boolean {
    return !!sessionStorage.getItem('userId') && !!localStorage.getItem('token')
  },

  // 保存登录信息到本地存储
  saveLoginInfo(userInfo: { userId: string; userName: string; role: string; token: string }): void {
    sessionStorage.setItem('userId', userInfo.userId)
    sessionStorage.setItem('userName', userInfo.userName)
    sessionStorage.setItem('role', userInfo.role)
    localStorage.setItem('token', userInfo.token)
  },

  // 清除登录状态（统一封装，避免重复代码）
  clearLoginState(): void {
    sessionStorage.clear()
    localStorage.removeItem('token')
  },

  // 退出登录并跳转
  logout(): void {
    this.clearLoginState()
    const router = useRouter()
    router.push('/login')
  },

  // 格式化日期（通用工具方法）
  formatDate(dateString: string): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

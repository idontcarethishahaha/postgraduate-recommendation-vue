import axios from '@/axios'
import router from '@/router'
import { useUserStore } from '@/stores/UserStore'
import type { LoginRequest, ResultVO, User } from '@/types'
import { getCollegeIdFromToken } from '@/utils/token'
import { ADMIN, COLLEGE_ADMIN, COUNSELOR, ROUTE_PATHS, STUDENT } from './Const'

export class UserService {
  static async loginService(loginData: LoginRequest): Promise<void> {
    const resp = await axios.post<ResultVO<User>>('/open/login', loginData)
    const user = resp.data.data
    const token = resp.headers.token
    const role = resp.headers.role

    if (!user || !token || !role) {
      throw new Error('登录错误：缺少必要信息')
    }

    if (user.collegeId) {
      sessionStorage.setItem('collegeId', user.collegeId)
      console.log('从 user 中获取的学院ID:', user.collegeId)
    }

    const userStore = useUserStore()
    userStore.setUserSessionStorage(user, role)

    //存储token到sessionStorage
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('role', role)
    //解析Token，存储学院ID（学院管理员）
    if (role === COLLEGE_ADMIN) {
      const cid = getCollegeIdFromToken()
      if (cid) {
        sessionStorage.setItem('collegeId', cid.toString())
      }
    }

    console.log('登录成功:', { user, token, role })

    // 根据角色跳转不同页面
    let path = ''
    switch (role) {
      case ADMIN:
        path = ROUTE_PATHS.ADMIN
        break
      case COLLEGE_ADMIN:
        //path = ROUTE_PATHS.COLLEGE_ADMIN
        // 学院管理员跳转到专业类别管理页（token里带学院ID）
        const collegeId = getCollegeIdFromToken()
        path = `/collegeadmin/major-categories/${collegeId}`
        break
      case COUNSELOR:
        path = ROUTE_PATHS.COUNSELOR
        break
      case STUDENT:
        path = ROUTE_PATHS.STUDENT
        break
      default:
        throw new Error('未知用户角色: ' + role)
    }
    console.log(path)

    router.push(path)
  }

  //获取当前用户信息
  static getCurrentUser(): User | null {
    const userStore = useUserStore()
    return userStore.getCurrentUser()
  }

  //获取当前用户角色
  static getRole(): string | null {
    const userStore = useUserStore()
    return userStore.getCurrentRole()
  }

  //从sessionStorage获取token
  static getToken(): string | null {
    return sessionStorage.getItem('token')
  }

  //检查是否已登录
  static isLoggedIn(): boolean {
    const userStore = useUserStore()
    return userStore.isLoggedIn()
  }

  static logout(): void {
    const userStore = useUserStore()
    userStore.clearUser()
    router.push('/login')
  }

  //验证登录表单
  static validateLoginForm(form: LoginRequest): { isValid: boolean; message: string } {
    if (!form.account?.trim() || !form.password?.trim()) {
      return { isValid: false, message: '请输入账号和密码' }
    }
    return { isValid: true, message: '' }
  }
}

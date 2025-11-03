import type { User } from '@/types'
import { shallowRef } from 'vue'

//从sessionStorage初始化用户数据
const userJson = sessionStorage.getItem('user')
const userS = shallowRef<User | null>(null)

if (userJson) {
  try {
    userS.value = JSON.parse(userJson)
  } catch (error) {
    console.error('解析用户数据失败:', error)
    sessionStorage.removeItem('user')
  }
}

//设置用户信息和角色到存储
const setUserSessionStorage = (user: User, role: string): void => {
  userS.value = user
  sessionStorage.setItem('role', role)
  sessionStorage.setItem('user', JSON.stringify(user))
}

//清除用户信息
const clearUser = (): void => {
  userS.value = null
  sessionStorage.removeItem('role')
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('token')
}

//获取当前用户
const getCurrentUser = (): User | null => {
  return userS.value
}

//获取当前用户角色

const getCurrentRole = (): string | null => {
  return sessionStorage.getItem('role')
}

//检查用户是否已登录
const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem('token') && !!userS.value
}

const store = {
  userS,
  setUserSessionStorage,
  clearUser,
  getCurrentUser,
  getCurrentRole,
  isLoggedIn
}

export const useUserStore = () => {
  return store
}

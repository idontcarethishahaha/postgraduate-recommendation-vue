import type { User } from '@/types'
import { shallowRef } from 'vue'

// 从sessionStorage初始化用户数据
const userJson = sessionStorage.getItem('user')
const userS = shallowRef<User | null>(null)
const collegeId = shallowRef<string | null>(null) // 新增：学院ID状态

// 初始化用户数据
if (userJson) {
  try {
    userS.value = JSON.parse(userJson)
  } catch (error) {
    console.error('解析用户数据失败:', error)
    sessionStorage.removeItem('user')
  }
}

// 初始化学院ID（如果存在）
const storedCollegeId = sessionStorage.getItem('collegeId')
if (storedCollegeId) {
  collegeId.value = storedCollegeId
}

// 设置用户信息和角色到存储
const setUserSessionStorage = (user: User, role: string): void => {
  userS.value = user
  sessionStorage.setItem('role', role)
  sessionStorage.setItem('user', JSON.stringify(user))

  // 同步学院ID状态（如果是学院管理员）
  if (role === 'COLLEGE_ADMIN') {
    const cid = sessionStorage.getItem('collegeId')
    collegeId.value = cid || null
  } else {
    collegeId.value = null // 非学院管理员清空学院ID
  }
}

// 清除用户信息
const clearUser = (): void => {
  userS.value = null
  collegeId.value = null // 清除学院ID
  sessionStorage.removeItem('role')
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('collegeId') // 清除学院ID存储
}

// 获取当前用户
const getCurrentUser = (): User | null => {
  return userS.value
}

// 获取当前用户角色
const getCurrentRole = (): string | null => {
  return sessionStorage.getItem('role')
}

// 获取学院ID
const getCollegeId = (): string | null => {
  return collegeId.value
}

// 检查用户是否已登录
const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem('token') && !!userS.value
}

const store = {
  userS,
  collegeId, // 暴露学院ID状态
  setUserSessionStorage,
  clearUser,
  getCurrentUser,
  getCurrentRole,
  getCollegeId, // 暴露获取学院ID的方法
  isLoggedIn
}

export const useUserStore = () => {
  return store
}

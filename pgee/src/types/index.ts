import { usePost } from '@/axios'

export interface LoginRequest {
  account: string
  password: string
}

export interface UserInfo {
  id: number
  account: string
  name: string
}

export const login = (data: LoginRequest) => {
  return usePost<UserInfo>('/open/login', data)
}

// 后端返回的统一响应格式
export interface ResultVO<T = unknown> {
  code: number
  number: number
  message: string
  data: T
}

//通用响应
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

//学院类型
export interface College {
  id: string
  name: string
  //code?: string
  createTime?: string
  updateTime?: string
}

//用户信息
export interface User {
  id: string
  name: string
  collegeId?: string
  account: string
  password?: string
  role: string
  tel?: string
  createTime?: string
  updateTime?: string
}

//学生信息
export interface StudentInfo {
  id: string
  userId: string
  majorId: string
  createTime?: string
  updateTime?: string
}

//辅导员信息
export interface CounselorInfo {
  id: string
  userId: string
  majorCategoryId: string
  createTime?: string
  updateTime?: string
}

//注册请求参数
export interface RegisterRequest {
  account: string
  name: string
  tel: string
  password: string
  collegeId: string
  majorId: string
}

//登录请求参数
export interface LoginRequest {
  account: string
  password: string
}

//登录响应（包含token）
export interface LoginResponse {
  user: User
  token: string
  role: string
}

//学院类型
export interface College {
  id: string
  name: string
  createTime?: string
  updateTime?: string
}

//添加学院,对应后端的DTO
export interface AddCollegeRequest {
  name: string
}

//更新学院
export interface UpdateCollegeRequest {
  name: string
}

//学院管理员类型
export interface CollegeAdmin {
  id: string
  name: string
  account: string
  tel?: string
  createTime?: string
}

//添加学院管理员
export interface AddCollegeAdminRequest {
  name: string
  account: string
  tel?: string
  password?: string
}

//专业类别
export interface MajorCategory {
  id: string
  name: string
  collegeId: string
  createTime?: string
  updateTime?: string
}

//专业类型
export interface Major {
  id: string
  name: string
  majorCategoryId: string
  createTime?: string
  updateTime?: string
}

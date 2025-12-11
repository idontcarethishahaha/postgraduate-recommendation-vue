//import { usePost } from '@/axios'

/*
export const login = (data: LoginRequest) => {
  return usePost<UserInfo>('/open/login', data)
}
*/
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

import axios from '@/axios'
import type { AddCollegeRequest, College, ResultVO, UpdateCollegeRequest } from '@/types'

export const getAllCollege = async (): Promise<College[]> => {
  const { data } = await axios.get('/open/colleges')
  return data.data
}

// 做这个测试前把后端的WebMvcConfig注释掉

export const addCollege = async (params: AddCollegeRequest): Promise<void> => {
  const { data } = await axios.post<ResultVO>('/admin/colleges', params)
  if (data.code !== 200) {
    throw new Error(data.message || '添加失败')
  }
}

export const updateCollege = async (
  collegeId: string,
  params: UpdateCollegeRequest
): Promise<void> => {
  const { data } = await axios.put<ResultVO>(`/admin/colleges/${collegeId}`, params)
  if (data.code !== 200) throw new Error(data.message || '更新失败')
}

export const removeCollege = async (collegeId: string): Promise<void> => {
  const { data } = await axios.delete<ResultVO>(`/admin/colleges/${collegeId}`)
  if (data.code !== 200) throw new Error(data.message || '删除失败')
}

import { baseUrl } from '@/config'
import type { College, CollegeForm } from '@/types'
import axios from 'axios'

export const CollegeService = {
  // 删除：原 validateCollegeForm 方法（已移到 CollegesView.vue 组件内）
  // 删除：原 initCollegeManagement 方法（已被 TanStack Query 替代）

  // 获取所有学院列表
  async getColleges(): Promise<College[]> {
    const response = await axios.get(`${baseUrl}/colleges`)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '加载学院列表失败')
    }
    return response.data.data
  },

  // 添加学院
  async addCollege(form: CollegeForm): Promise<void> {
    const response = await axios.post(`${baseUrl}/colleges`, form)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '添加学院失败')
    }
  },

  // 更新学院
  async updateCollege(form: CollegeForm): Promise<void> {
    const response = await axios.put(`${baseUrl}/colleges/${form.id}`, form)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '更新学院失败')
    }
  },

  // 删除学院
  async deleteCollege(id: string): Promise<void> {
    const response = await axios.delete(`${baseUrl}/colleges/${id}`)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '删除学院失败')
    }
  }
}

import axios from '@/axios'
import type { Major } from '@/types'

// 表单验证结果
interface ValidationResult {
  isValid: boolean
  message: string
}

export class MajorService {
  // 获取指定专业类别下的所有专业
  static async getMajorsByCategoryId(categoryId: string): Promise<Major[]> {
    const response = await axios.get(`/major-categories/${categoryId}/majors`)
    if (response.data.code === 200) {
      return response.data.data || []
    }
    throw new Error(response.data.message || '加载专业列表失败')
  }

  // 添加专业（关联到专业类别）
  static async addMajor(data: Omit<Major, 'id' | 'createTime' | 'updateTime'>): Promise<Major> {
    const response = await axios.post('/majors', data)
    if (response.data.code === 200) {
      return response.data.data || {}
    }
    throw new Error(response.data.message || '添加专业失败')
  }

  // 更新专业信息
  static async updateMajor(
    majorId: string,
    data: Partial<Omit<Major, 'id' | 'majorCategoryId' | 'createTime' | 'updateTime'>>
  ): Promise<Major> {
    const response = await axios.put(`/majors/${majorId}`, data)
    if (response.data.code === 200) {
      return response.data.data || {}
    }
    throw new Error(response.data.message || '更新专业失败')
  }

  // 删除专业
  static async deleteMajor(majorId: string): Promise<void> {
    const response = await axios.delete(`/majors/${majorId}`)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '删除专业失败')
    }
  }

  // 校验专业表单
  static validateMajorForm(form: { name: string }): ValidationResult {
    if (!form.name || form.name.trim() === '') {
      return { isValid: false, message: '请输入专业名称' }
    }
    return { isValid: true, message: '' }
  }
}

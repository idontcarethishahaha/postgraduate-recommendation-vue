import axios from '@/axios'
import type {
  AddMajorCategoryRequest,
  CalculationRuleStorage,
  MajorCategory,
  UpdateMajorCategoryRequest
} from '@/types'

// 表单验证结果
interface ValidationResult {
  isValid: boolean
  message: string
}

export class MajorCategoryService {
  // 获取指定学院的所有专业类别
  static async getCategoriesByCollegeId(collegeId: string): Promise<MajorCategory[]> {
    const response = await axios.get(`/colleges/${collegeId}/major-categories`)
    if (response.data.code === 200) {
      return response.data.data || []
    }
    throw new Error(response.data.message || '加载专业类别列表失败')
  }

  // 获取单个专业类别详情
  static async getCategoryById(categoryId: string): Promise<MajorCategory> {
    const response = await axios.get(`/major-categories/${categoryId}`)
    if (response.data.code === 200) {
      return response.data.data || {}
    }
    throw new Error(response.data.message || '加载专业类别详情失败')
  }

  // 添加专业类别
  static async addCategory(
    collegeId: string,
    data: AddMajorCategoryRequest
  ): Promise<MajorCategory> {
    const response = await axios.post(`/colleges/${collegeId}/major-categories`, data)
    if (response.data.code === 200) {
      return response.data.data || {}
    }
    throw new Error(response.data.message || '添加专业类别失败')
  }

  // 更新专业类别
  static async updateCategory(
    categoryId: string,
    data: UpdateMajorCategoryRequest
  ): Promise<MajorCategory> {
    const response = await axios.put(`/major-categories/${categoryId}`, data)
    if (response.data.code === 200) {
      return response.data.data || {}
    }
    throw new Error(response.data.message || '更新专业类别失败')
  }

  // 删除专业类别
  static async deleteCategory(categoryId: string): Promise<void> {
    const response = await axios.delete(`/major-categories/${categoryId}`)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '删除专业类别失败')
    }
  }

  // 校验计算规则的合法性
  static validateCalculationRule(rule: CalculationRuleStorage): ValidationResult {
    const total = Object.values(rule).reduce((sum, weight) => sum + weight, 0)
    if (total !== 100) {
      return { isValid: false, message: `权重总和需为100（当前：${total}）` }
    }
    const emptyKey = Object.keys(rule).find(key => !key.trim())
    if (emptyKey) {
      return { isValid: false, message: '规则名称不能为空' }
    }
    return { isValid: true, message: '' }
  }
}

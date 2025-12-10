import axios from '@/axios'
import type { CalculationRuleStorage, MajorCategory } from '@/types'

// MajorCategoryAddDTO/UpdateDTO
export interface MajorCategoryAddDTO {
  name: string
  calculationRule: CalculationRuleStorage
}

export interface MajorCategoryUpdateDTO {
  name: string
  calculationRule: CalculationRuleStorage
}

// 后端返回的 ResultVO 类型
interface ResultVO<T = unknown> {
  code: number
  message?: string
  data: T
}

// 表单验证结果
interface ValidationResult {
  isValid: boolean
  message: string
}

// 错误
class RequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestError'
  }
}

export class MajorCategoryService {
  static async getCategoriesByCollegeId(): Promise<MajorCategory[]> {
    const response = await axios.get<ResultVO<MajorCategory[]>>('/collegeadmin/categories')
    if (response.data.code === 200) {
      return response.data.data || []
    }
    throw new RequestError(response.data.message || '加载专业类别列表失败')
  }

  static async addCategory(data: MajorCategoryAddDTO): Promise<MajorCategory> {
    const response = await axios.post<ResultVO<MajorCategory>>('/collegeadmin/categories', data)
    if (response.data.code === 200) {
      return response.data.data as MajorCategory
    }
    throw new RequestError(response.data.message || '添加专业类别失败')
  }

  static async updateCategory(
    categoryId: string,
    data: MajorCategoryUpdateDTO
  ): Promise<MajorCategory> {
    const response = await axios.put<ResultVO<MajorCategory>>(
      `/collegeadmin/categories/${categoryId}`,
      data
    )
    if (response.data.code === 200) {
      return response.data.data as MajorCategory
    }
    throw new RequestError(response.data.message || '更新专业类别失败')
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const response = await axios.delete<ResultVO<null>>(`/collegeadmin/categories/${categoryId}`)
    if (response.data.code !== 200) {
      throw new RequestError(response.data.message || '删除专业类别失败')
    }
  }

  static validateCalculationRule(rule: CalculationRuleStorage): ValidationResult {
    const total = Object.values(rule).reduce((sum, weight) => {
      const numWeight = Number(weight)
      return sum + (isNaN(numWeight) ? 0 : numWeight)
    }, 0)

    if (total !== 100) {
      return { isValid: false, message: `权重总和需为100（当前：${total}）` }
    }

    const emptyKey = Object.keys(rule).find(key => key.trim() === '')
    if (emptyKey) {
      return { isValid: false, message: '规则名称不能为空' }
    }

    return { isValid: true, message: '' }
  }

  static async getCategoryById(categoryId: string): Promise<MajorCategory> {
    const categories = await this.getCategoriesByCollegeId()
    const category = categories.find(item => item.id === categoryId)

    if (!category) {
      throw new RequestError('专业类别不存在')
    }
    return category
  }
}

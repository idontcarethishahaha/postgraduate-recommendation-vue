import { useDelete, useGet, usePost, usePut } from '@/axios'
import type { CalculationRuleStorage, MajorCategory } from '@/types'

export interface MajorCategoryAddDTO {
  name: string
  calculationRule: CalculationRuleStorage
}

export interface MajorCategoryUpdateDTO {
  name: string
  calculationRule: CalculationRuleStorage
}

export class RequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestError'
  }
}

// 表单验证
interface ValidationResult {
  isValid: boolean
  message: string
}

export class MajorCategoryService {
  static async getCategoriesByCollegeId(): Promise<MajorCategory[]> {
    // 调用后端接口：/api/collegeadmin/categories（从 token 获取 cid）
    return await useGet<MajorCategory[]>('/collegeadmin/categories')
  }

  static async addCategory(data: MajorCategoryAddDTO): Promise<MajorCategory> {
    return await usePost<MajorCategory>('/collegeadmin/categories', data)
  }

  static async updateCategory(
    categoryId: string,
    data: MajorCategoryUpdateDTO
  ): Promise<MajorCategory> {
    return await usePut<MajorCategory>(`/collegeadmin/categories/${categoryId}`, data)
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    await useDelete<void>(`/collegeadmin/categories/${categoryId}`)
  }

  static async getCategoryById(categoryId: string): Promise<MajorCategory> {
    const categories = await this.getCategoriesByCollegeId()
    const category = categories.find(item => item.id === categoryId)

    if (!category) {
      throw new RequestError('未找到该专业类别')
    }
    return category
  }

  static validateCalculationRule(rule: CalculationRuleStorage): ValidationResult {
    // 计算权重总和
    const totalWeight = Object.values(rule).reduce((sum, weight) => {
      const num = Number(weight)
      return sum + (isNaN(num) ? 0 : num)
    }, 0)

    if (totalWeight !== 100) {
      return {
        isValid: false,
        message: `权重总和必须为 100（当前：${totalWeight}）`
      }
    }

    const hasEmptyRuleName = Object.keys(rule).some(key => key.trim() === '')
    if (hasEmptyRuleName) {
      return {
        isValid: false,
        message: '规则名称不能为空'
      }
    }

    return {
      isValid: true,
      message: '验证通过'
    }
  }
}

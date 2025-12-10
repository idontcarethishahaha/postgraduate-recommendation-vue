import axios from '@/axios'
import type { CalculationRuleStorage, MajorCategory } from '@/types'

// 适配后端的 DTO 类型（与后端 MajorCategoryAddDTO/UpdateDTO 对应）
export interface MajorCategoryAddDTO {
  name: string
  calculationRule: CalculationRuleStorage
}

export interface MajorCategoryUpdateDTO {
  name: string
  calculationRule: CalculationRuleStorage
}

// 定义后端返回的 ResultVO 类型（与后端一致）
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

// 自定义错误类型（替代 any 捕获错误）
class RequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestError'
  }
}

export class MajorCategoryService {
  // ========== 1. 获取学院下的所有专业类别 ==========
  static async getCategoriesByCollegeId(): Promise<MajorCategory[]> {
    try {
      // 明确响应类型为 ResultVO<MajorCategory[]>
      const response = await axios.get<ResultVO<MajorCategory[]>>('/collegeadmin/categories')
      if (response.data.code === 200) {
        return response.data.data || []
      }
      throw new RequestError(response.data.message || '加载专业类别列表失败')
    } catch (error) {
      // 精确判断错误类型
      if (error instanceof RequestError) {
        console.error('获取专业类别失败：', error.message)
        throw error
      } else if (error instanceof Error) {
        console.error('获取专业类别失败：', error.message)
        throw new RequestError('加载专业类别列表失败')
      } else {
        console.error('获取专业类别失败：', error)
        throw new RequestError('加载专业类别列表失败')
      }
    }
  }

  // ========== 2. 添加专业类别 ==========
  static async addCategory(data: MajorCategoryAddDTO): Promise<MajorCategory> {
    try {
      const response = await axios.post<ResultVO<MajorCategory>>('/collegeadmin/categories', data)
      if (response.data.code === 200) {
        return response.data.data as MajorCategory
      }
      throw new RequestError(response.data.message || '添加专业类别失败')
    } catch (error) {
      if (error instanceof RequestError) {
        console.error('添加专业类别失败：', error.message)
        throw error
      } else if (error instanceof Error) {
        console.error('添加专业类别失败：', error.message)
        throw new RequestError('添加专业类别失败')
      } else {
        console.error('添加专业类别失败：', error)
        throw new RequestError('添加专业类别失败')
      }
    }
  }

  // ========== 3. 更新专业类别 ==========
  static async updateCategory(
    categoryId: string,
    data: MajorCategoryUpdateDTO
  ): Promise<MajorCategory> {
    try {
      const response = await axios.put<ResultVO<MajorCategory>>(
        `/collegeadmin/categories/${categoryId}`,
        data
      )
      if (response.data.code === 200) {
        return response.data.data as MajorCategory
      }
      throw new RequestError(response.data.message || '更新专业类别失败')
    } catch (error) {
      if (error instanceof RequestError) {
        console.error('更新专业类别失败：', error.message)
        throw error
      } else if (error instanceof Error) {
        console.error('更新专业类别失败：', error.message)
        throw new RequestError('更新专业类别失败')
      } else {
        console.error('更新专业类别失败：', error)
        throw new RequestError('更新专业类别失败')
      }
    }
  }

  // ========== 4. 删除专业类别 ==========
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const response = await axios.delete<ResultVO<null>>(`/collegeadmin/categories/${categoryId}`)
      if (response.data.code !== 200) {
        throw new RequestError(response.data.message || '删除专业类别失败')
      }
    } catch (error) {
      if (error instanceof RequestError) {
        console.error('删除专业类别失败：', error.message)
        throw error
      } else if (error instanceof Error) {
        console.error('删除专业类别失败：', error.message)
        throw new RequestError('删除专业类别失败')
      } else {
        console.error('删除专业类别失败：', error)
        throw new RequestError('删除专业类别失败')
      }
    }
  }

  // ========== 5. 校验计算规则的合法性 ==========
  static validateCalculationRule(rule: CalculationRuleStorage): ValidationResult {
    // 确保权重是数字类型
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

  // ========== 6. 获取单个专业类别详情 ==========
  static async getCategoryById(categoryId: string): Promise<MajorCategory> {
    try {
      const categories = await this.getCategoriesByCollegeId()
      const category = categories.find(item => item.id === categoryId)

      if (!category) {
        throw new RequestError('专业类别不存在')
      }
      return category
    } catch (error) {
      if (error instanceof RequestError) {
        console.error('获取专业类别详情失败：', error.message)
        throw error
      } else if (error instanceof Error) {
        console.error('获取专业类别详情失败：', error.message)
        throw new RequestError('加载专业类别详情失败')
      } else {
        console.error('获取专业类别详情失败：', error)
        throw new RequestError('加载专业类别详情失败')
      }
    }
  }
}

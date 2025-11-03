import axios from '@/axios'
import type { College, Major, RegisterRequest } from '@/types'

// 表单验证结果
interface ValidationResult {
  isValid: boolean
  message: string
}

// 用于验证的表单
interface RegisterFormData {
  account?: string
  name?: string
  tel?: string
  password?: string
  collegeId?: string
  majorId?: string
}

export class StudentService {
  //获取所有学院列表
  static async getColleges(): Promise<College[]> {
    const response = await axios.get('/open/colleges')
    if (response.data.code === 200) {
      return response.data.data || []
    }
    throw new Error(response.data.message || '加载学院列表失败')
  }

  //根据学院ID获取专业列表
  static async getMajorsByCollege(collegeId: string): Promise<Major[]> {
    const response = await axios.get(`/open/colleges/${collegeId}/majors`)
    if (response.data.code === 200) {
      return response.data.data || []
    }
    throw new Error(response.data.message || '加载专业列表失败')
  }

  //学生注册
  static async register(studentData: RegisterRequest): Promise<void> {
    const response = await axios.post('/open/register', studentData)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '注册失败')
    }
  }

  //验证注册表单
  static validateRegisterForm(form: RegisterFormData): ValidationResult {
    if (
      !form.account?.trim() ||
      !form.name?.trim() ||
      !form.tel?.trim() ||
      !form.password ||
      !form.collegeId ||
      !form.majorId
    ) {
      return { isValid: false, message: '请填写所有必填字段' }
    }

    const telRegex = /^1[3-9]\d{9}$/
    if (!telRegex.test(form.tel)) {
      return { isValid: false, message: '请输入正确格式的手机号' }
    }

    return { isValid: true, message: '' }
  }
}

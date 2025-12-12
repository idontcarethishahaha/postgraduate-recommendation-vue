import axios from '@/axios'
import type { ResultVO, User } from '@/types'

export class CollegeAdminService {
  //获取学院管理员列表
  static async getCollegeAdmins(collegeId: string): Promise<User[]> {
    const response = await axios.get<ResultVO<User[]>>(`/admin/colleges/${collegeId}/collegeadmins`)
    if (response.data.code === 200) {
      return response.data.data || []
    }
    throw new Error(response.data.message || '加载管理员列表失败')
  }

  //添加学院管理员
  static async addCollegeAdmin(
    collegeId: string,
    adminData: {
      name: string
      account: string
      tel?: string
      password: string
    }
  ): Promise<void> {
    const response = await axios.post<ResultVO<User>>(
      `/admin/colleges/${collegeId}/collegeadmins`,
      adminData
    )
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '添加管理员失败')
    }
  }

  //重置用户密码
  static async resetPassword(userAccount: string): Promise<void> {
    const response = await axios.put<ResultVO<void>>(`/admin/users/${userAccount}/password`)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '重置密码失败')
    }
  }

  //移除学院管理员
  static async removeCollegeAdmin(collegeId: string, userId: string): Promise<void> {
    const response = await axios.delete<ResultVO<void>>(
      `/admin/colleges/${collegeId}/collegeadmins/${userId}`
    )
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '移除管理员失败')
    }
  }

  //验证管理员表单
  static validateAdminForm(form: { name: string; account: string }): {
    isValid: boolean
    message: string
  } {
    if (!form.name?.trim()) {
      return { isValid: false, message: '请输入姓名' }
    }
    if (!form.account?.trim()) {
      return { isValid: false, message: '请输入账号' }
    }
    return { isValid: true, message: '' }
  }
}

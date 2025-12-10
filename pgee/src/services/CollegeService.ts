import axios from '@/axios'
import { createMessageDialog } from '@/components/message'
import { useCollegeStore } from '@/stores/CollegeStore'
import type { College, ResultVO } from '@/types'
import type { AddCollegeRequest, UpdateCollegeRequest } from '@/types/index'
import { CommonService } from './index'

const collegeStore = useCollegeStore()

export class CollegeService {
  static async initCollegeManagement(): Promise<boolean> {
    console.log('组件挂载，开始检查登录状态...')
    if (!CommonService.checkAdminLogin()) {
      return false
    }

    console.log('登录状态验证通过，开始加载学院列表...')
    await this.loadColleges()
    return true
  }

  //加载学院列表
  static async loadColleges(): Promise<void> {
    console.log('开始加载学院列表...')
    const response = await axios.get<ResultVO<College[]>>('/admin/colleges')
    //Axios拦截器已确保code<300，无需额外判断
    collegeStore.setColleges(response.data.data || [])
    console.log('成功加载学院数量:', collegeStore.collegesS.value.length)
  }

  //添加学院
  static async addCollege(collegeData: AddCollegeRequest): Promise<void> {
    const response = await axios.post<ResultVO<College>>('/admin/colleges', collegeData)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '添加学院失败')
    }
    createMessageDialog('添加成功')
    await this.loadColleges()
  }

  //更新学院
  static async updateCollege(collegeId: string, collegeData: UpdateCollegeRequest): Promise<void> {
    const response = await axios.put<ResultVO<College>>(`/admin/colleges/${collegeId}`, collegeData)
    if (response.data.code !== 200) {
      throw new Error(response.data.message || '更新学院失败')
    }
    collegeStore.updateCollege(collegeId, { name: collegeData.name })
    createMessageDialog('更新成功')
  }

  //删除学院
  static async deleteCollege(college: College): Promise<void> {
    const confirmed = await this.confirmAction(
      `确定要删除学院 "${college.name}" 吗？此操作不可恢复！`
    )
    if (!confirmed) return

    await axios.delete<ResultVO<void>>(`/admin/colleges/${college.id}`)
    collegeStore.removeCollege(college.id)
    createMessageDialog('删除成功')
  }

  static validateCollegeForm(form: { name: string }): { isValid: boolean; message: string } {
    if (!form.name?.trim()) {
      return { isValid: false, message: '请输入学院名称' }
    }
    return { isValid: true, message: '' }
  }

  private static confirmAction(message: string): Promise<boolean> {
    return Promise.resolve(window.confirm(message))
  }

  // 根据学院ID获取单个学院详情
  static async getCollegeById(collegeId: string): Promise<College> {
    const response = await axios.get(`/colleges/${collegeId}`)
    if (response.data.code === 200) {
      return response.data.data || ({} as College)
    }
    throw new Error(response.data.message || '加载学院信息失败')
  }
}

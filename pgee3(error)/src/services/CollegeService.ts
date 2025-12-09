import { useDelete, useGet, usePost, usePut } from '@/axios'
//import { createElLoading } from '@/components/loading'
import { createMessageDialog } from '@/components/message'
import type { College, ResultVO } from '@/types'
import type { AddCollegeRequest, UpdateCollegeRequest } from '@/types/index'
import { querycachename } from '@/vuequery/Const'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { CommonService } from './CommonService'

// 完全移除复杂拼接函数，直接硬编码URL（和旧代码一致，零风险）
const BASE_URL = '/admin/colleges'

export class CollegeService {
  /**
   * 检查管理员登录状态（复用旧代码逻辑，保证登录判断一致）
   */
  static checkAdminLogin() {
    return CommonService.checkAdminLogin()
  }

  /**
   * 学院列表查询配置（极简版，对齐旧代码请求逻辑）
   */
  static getCollegesQueryConfig() {
    return {
      queryKey: [querycachename.college.list],
      queryFn: async () => {
        // 未登录直接返回空数组，避免请求报错
        if (!this.checkAdminLogin()) return []

        // 完全对齐旧代码的请求方式：直接用BASE_URL，无拼接
        const response = await useGet<ResultVO<College[]>>(BASE_URL)
        // 保留旧代码的判断逻辑（Axios拦截器已处理code<300）
        return response.data.data || []
      },
      // 仅登录后执行请求（关键：和路由守卫登录状态联动）
      enabled: this.checkAdminLogin(),
      staleTime: 5 * 60 * 1000
    }
  }

  /**
   * 获取学院列表（组件中调用）
   */
  static useCollegesQuery() {
    return useQuery(this.getCollegesQueryConfig())
  }

  /**
   * 添加学院（URL完全对齐旧代码）
   */
  static addCollegeService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: AddCollegeRequest) =>
        usePost<ResultVO<College>>(BASE_URL, data).then(res => {
          if (res.data.code !== 200) {
            throw new Error(res.data.message || '添加学院失败')
          }
          return res.data.data
        }),
      onSuccess: () => {
        createMessageDialog('添加成功')
        queryClient.invalidateQueries({ queryKey: [querycachename.college.list] })
      }
    })
  }

  /**
   * 更新学院（URL拼接和旧代码一致：/admin/colleges/{id}）
   */
  static updateCollegeService(collegeId: string) {
    const queryClient = useQueryClient()
    // 极简拼接：直接字符串拼接，和旧代码`/admin/colleges/${collegeId}`完全一致
    const updateUrl = `${BASE_URL}/${collegeId}`

    return useMutation({
      mutationFn: (data: UpdateCollegeRequest) =>
        usePut<ResultVO<College>>(updateUrl, data).then(res => {
          if (res.data.code !== 200) {
            throw new Error(res.data.message || '更新学院失败')
          }
          return res.data.data
        }),
      onSuccess: () => {
        createMessageDialog('更新成功')
        queryClient.invalidateQueries({ queryKey: [querycachename.college.list] })
      }
    })
  }

  /**
   * 删除学院（URL拼接和旧代码一致）
   */
  static deleteCollegeService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (college: College) => {
        // 极简拼接：和旧代码`/admin/colleges/${college.id}`完全一致
        const deleteUrl = `${BASE_URL}/${college.id}`

        return this.confirmAction(`确定删除学院"${college.name}"？`)
          .then(confirmed => {
            if (!confirmed) throw new Error('取消删除')
            return useDelete<ResultVO<void>>(deleteUrl)
          })
          .then(res => {
            if (res.data.code !== 200) {
              throw new Error(res.data.message || '删除失败')
            }
          })
      },
      onSuccess: () => {
        createMessageDialog('删除成功')
        queryClient.invalidateQueries({ queryKey: [querycachename.college.list] })
      }
    })
  }

  /**
   * 学院表单验证（完全复用旧代码）
   */
  static validateCollegeForm(form: { name: string }): { isValid: boolean; message: string } {
    if (!form.name?.trim()) {
      return { isValid: false, message: '请输入学院名称' }
    }
    return { isValid: true, message: '' }
  }

  /**
   * 确认弹窗封装（完全复用旧代码）
   */
  private static confirmAction(message: string): Promise<boolean> {
    return Promise.resolve(window.confirm(message))
  }

  /**
   * 预加载学院数据（修复上下文问题，仅登录后执行）
   */
  static prefetchColleges(queryClient: ReturnType<typeof useQueryClient>) {
    if (this.checkAdminLogin()) {
      queryClient.prefetchQuery(this.getCollegesQueryConfig())
    }
  }
}

import axios, { useGet, usePost } from '@/axios'
import { createProgressNotification } from '@/components/progress'
import router from '@/router'
import { ADMIN, COLLEGE_ADMIN, COUNSELOR, STUDENT } from '@/services/Const'
import { useUserStore } from '@/stores/UserStore'
import type { College, Major, Progress, RegisterUserDTO, ResultVO, User, UserInfo } from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'

const addPreUrl = (url: string) => `open/${url}`

// 获取用户状态管理实例，全局存储登录信息
const userStore = useUserStore()
export class CommonService {
  //获取学院列表&对应专业，注册
  static listCollegesService() {
    return useQuery({
      queryKey: ['colleges'],
      queryFn: () => useGet<{ college: College; majors: Major[] }[]>(addPreUrl('colleges'))
    })
  }

  // 注册
  static async registerService(user: RegisterUserDTO) {
    console.log('最终传递给后端的参数：', user)
    await usePost(addPreUrl('register'), user)
    CommonService.loginService({ account: user.account, password: user.account })
  }

  //登录
  static loginService = async (user: User) => {
    const resp = await axios.post<ResultVO<UserInfo>>(addPreUrl('login'), user)
    const token = resp.headers.token
    const role = resp.headers.role
    //
    console.log('登录响应头：', resp.headers)
    console.log('登录响应体：', resp.data)
    //
    if (!token || !role) {
      throw '登录错误'
    }
    //
    console.log('提取的token:', token)
    console.log('提取的role:', role)
    //
    userStore.setUserSessionStorage(resp.data.data, token, role)
    if (user.account === user.password) {
      router.push('/settings')
      throw '账号密码相同，建议重置密码'
    }
    let path = ''
    switch (role) {
      case ADMIN:
        path = '/admin/colleges'
        break
      case STUDENT:
        path = '/student'
        break
      case COLLEGE_ADMIN:
      case COUNSELOR:
        path = '/college'
        break
    }
    router.push(path)
  }

  // 修改密码
  static updatePasswordService = async (pwd: string) => {
    await usePost('passwords', { password: pwd })
  }

  //获取当前登录用户的角色
  static getRoleService() {
    return sessionStorage.getItem('role')
  }

  //获取当前登录用户的详细信息
  static getUserInfoService() {
    return useQuery({
      queryKey: [querycachename.common.userinfo],
      queryFn: async () => {
        const res = await useGet<UserInfo>('info')
        // 后端UserInfoDTO
        console.log('获取用户信息接口返回：', res)
        return res
      }
    })
  }
  //============================================
  //退出登录，清空登录状态，返回登录页面
  static clearLoginService() {
    sessionStorage.clear()
    router.push('/login')
  }

  //文件下载
  static async downloadFile(url: string, name: string) {
    //下载进度
    const progressR = ref<{ progress: Progress }>({
      progress: { percentage: 0, title: name, rate: 0, total: 0, loaded: 0 }
    })

    //下载进度通知
    const progNotif = createProgressNotification(progressR.value)
    const resp = await axios.get(url, {
      responseType: 'blob', //回二进制文件流
      onDownloadProgress(ProgressEvent) {
        //监听下载进度
        if (!ProgressEvent) return
        //实时更新下载进度
        progressR.value.progress.percentage = ProgressEvent.progress ?? 0
        progressR.value.progress.rate = ProgressEvent.rate ?? 0
        progressR.value.progress.loaded = ProgressEvent.loaded ?? 0
        progressR.value.progress.total = ProgressEvent.total ?? 0
      }
    })
    progNotif.close() //关闭进度通知

    //解析响应头中的文件名
    const filename = decodeURIComponent(resp.headers['filename'])
    //二进制文件的临时URL
    const urlFile = window.URL.createObjectURL(new Blob([resp.data]))
    const link = document.createElement('a')
    link.href = urlFile
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    window.URL.revokeObjectURL(urlFile)
    document.body.removeChild(link)

    return resp
  }
}

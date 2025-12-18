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

const userStore = useUserStore()
export class CommonService {
  static listCollegesService() {
    return useQuery({
      queryKey: ['colleges'],
      queryFn: () => useGet<{ college: College; majors: Major[] }[]>(addPreUrl('colleges'))
    })
  }

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

  static getRoleService() {
    return sessionStorage.getItem('role')
  }

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

  static clearLoginService() {
    sessionStorage.clear()
    router.push('/login')
  }

  static async downloadFile(url: string, name: string) {
    const progressR = ref<{ progress: Progress }>({
      progress: { percentage: 0, title: name, rate: 0, total: 0, loaded: 0 }
    })

    const progNotif = createProgressNotification(progressR.value)
    const resp = await axios.get(url, {
      responseType: 'blob',
      onDownloadProgress(ProgressEvent) {
        if (!ProgressEvent) return
        progressR.value.progress.percentage = ProgressEvent.progress ?? 0
        progressR.value.progress.rate = ProgressEvent.rate ?? 0
        progressR.value.progress.loaded = ProgressEvent.loaded ?? 0
        progressR.value.progress.total = ProgressEvent.total ?? 0
      }
    })
    progNotif.close()

    const filename = decodeURIComponent(resp.headers['filename'])
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

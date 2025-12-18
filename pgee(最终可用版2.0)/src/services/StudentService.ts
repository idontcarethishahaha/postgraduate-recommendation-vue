import axios, { useDelete, useGet, usePatch, usePost } from '@/axios'
import { createElLoading } from '@/components/loading'
import { createProgressNotification } from '@/components/progress'
import type {
  Item,
  MajorCategory,
  Progress,
  ResultVO,
  StudentItem,
  StudentItemLog,
  StudentItemResp,
  StudentItemsStatusDO,
  WeightedScore
} from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { CommonService } from './CommonService'

//统一拼接接口前缀
const addPreUrl = (url: string) => `student/${url}`

export class StudentService {
  // 拉取一级指标项
  static listTopLevelItemsService() {
    return useQuery({
      queryKey: [querycachename.student.topitems],
      queryFn: () => useGet<Item[]>(addPreUrl('topitems'))
    })
  }

  // 指标项列表
  static listItemsService(itemid: MaybeRefOrGetter<string>, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.student.items, itemid],
      queryFn: () => createElLoading(useGet<Item>(addPreUrl(`items/${toValue(itemid)}`))),
      enabled
    })
  }

  // 获取学生加权分数
  static getWeightedScoreService() {
    return useQuery({
      queryKey: [querycachename.student.weightedscores],
      queryFn: () => useGet<WeightedScore>(addPreUrl('weightedscores'))
    })
  }

  // 添加加权分数
  static addWeightedScoreService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (score: WeightedScore) =>
        usePost<WeightedScore>(addPreUrl('weightedscores'), score),
      onSuccess: () => qc.refetchQueries({ queryKey: [querycachename.student.weightedscores] })
    })
  }
  // 学生提交指标项列表
  static listStudentItemsService(rootitemid: MaybeRefOrGetter<string>) {
    return useQuery({
      queryKey: [querycachename.student.studentitems, rootitemid],
      queryFn: () => useGet<StudentItemResp[]>(addPreUrl(`studentitems/${toValue(rootitemid)}`))
    })
  }

  // 下载学生提交的指标项附件
  static async downloadStudentItemFileService(id: string, name: string) {
    await CommonService.downloadFile(addPreUrl(`studentitems/files/${id}`), name)
  }

  // 学生，移除提交的指标项附件
  static removeStudentItemFileService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (fileid: string) =>
        useDelete<StudentItemResp[]>(addPreUrl(`studentitems/files/${fileid}`)),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  // 学生，移除提交的指标项申请
  static removeStudentItemService(rootitemid: MaybeRefOrGetter<string>) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (stuitemid: string) =>
        useDelete<StudentItemResp[]>(addPreUrl(`studentitems/${stuitemid}`)),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  // 学生，提交指标项申请
  static addStudentItemService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (stuItem: StudentItem) =>
        usePost<StudentItemResp[]>(addPreUrl(`studentitems`), stuItem),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }
  //上传过程中实时展示进度条通知，完成后更新页面数据
  // 私有静态方法，处理文件上传、监听上传进度、展示进度通知、返回上传结果
  private static async _uploadStudentItemFileService(fdata: FormData, stuitemid: string) {
    const uploadFile = fdata.get('file')
    const fileName = uploadFile instanceof File ? uploadFile.name : ''
    const progressR = ref<{ progress: Progress }>({
      progress: { percentage: 0, title: fileName, rate: 0, total: 0, loaded: 0 }
    })

    const progNotif = createProgressNotification(progressR.value)
    const resp = await axios.post<ResultVO<StudentItemResp[]>>(
      addPreUrl(`studentitems/${stuitemid}/files`),
      fdata,
      {
        onUploadProgress(ProgressEvent) {
          if (!ProgressEvent) return
          progressR.value.progress.percentage = ProgressEvent.progress ?? 0
          progressR.value.progress.rate = ProgressEvent.rate ?? 0
          progressR.value.progress.loaded = ProgressEvent.loaded ?? 0
          progressR.value.progress.total = ProgressEvent.total ?? 0
        }
      }
    )
    progNotif.close()
    return resp.data.data
  }

  // 公有静态方法
  //对外暴露的 mutation 方法，基于 Vue Query 封装上传逻辑，成功后刷新缓存
  static uploadStudentItemFileService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async ({ fdata, stuitemid }: { fdata: FormData; stuitemid: string }) =>
        await StudentService._uploadStudentItemFileService(fdata, stuitemid),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  // 学生，修改提交的指标项申请
  static updateStudentItemService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ studentItemId, stuItem }: { studentItemId: string; stuItem: StudentItem }) =>
        usePatch<StudentItemResp[]>(addPreUrl(`studentitems/${studentItemId}`), stuItem),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  // 学生指标项状态
  static getStudentItemStatusesService() {
    return useQuery({
      queryKey: [querycachename.student.statuses],
      queryFn: () => useGet<StudentItemsStatusDO>(addPreUrl('statuses'))
    })
  }

  // 学生指标项日志
  static listStudentItemLogsService(id: string) {
    return useQuery({
      queryKey: ['logs', id],
      queryFn: () => useGet<StudentItemLog[]>(addPreUrl(`logs/${id}`))
    })
  }

  //获取类别
  static getCategoryService() {
    return useQuery({
      queryKey: [querycachename.student.category],
      queryFn: () => useGet<MajorCategory>(addPreUrl('category'))
    })
  }
}

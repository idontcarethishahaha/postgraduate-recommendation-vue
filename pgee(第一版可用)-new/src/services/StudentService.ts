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
//
const addPreUrl = (url: string) => `student/${url}`

export class StudentService {
  //
  static listTopLevelItemsService() {
    return useQuery({
      queryKey: [querycachename.student.topitems],
      queryFn: () => useGet<Item[]>(addPreUrl('topitems'))
    })
  }

  static listItemsService(itemid: MaybeRefOrGetter<string>, enabled?: MaybeRefOrGetter) {
    return useQuery({
      queryKey: [querycachename.student.items, itemid],
      queryFn: () => createElLoading(useGet<Item>(addPreUrl(`items/${toValue(itemid)}`))),
      enabled
    })
  }

  static getWeightedScoreService() {
    return useQuery({
      queryKey: [querycachename.student.weightedscores],
      queryFn: () => useGet<WeightedScore>(addPreUrl('weightedscores'))
    })
  }

  static addWeightedScoreService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (score: WeightedScore) =>
        usePost<WeightedScore>(addPreUrl('weightedscores'), score),
      onSuccess: () => qc.refetchQueries({ queryKey: [querycachename.student.weightedscores] })
    })
  }

  static listStudentItemsService(rootitemid: MaybeRefOrGetter<string>) {
    return useQuery({
      queryKey: [querycachename.student.studentitems, rootitemid],
      queryFn: () => useGet<StudentItemResp[]>(addPreUrl(`studentitems/${toValue(rootitemid)}`))
    })
  }

  //
  static async downloadStudentItemFileService(id: string, name: string) {
    await CommonService.downloadFile(addPreUrl(`studentitems/files/${id}`), name)
  }

  static removeStudentItemFileService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (fileid: string) =>
        useDelete<StudentItemResp[]>(addPreUrl(`studentitems/files/${fileid}`)),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  //
  static removeStudentItemService(rootitemid: MaybeRefOrGetter<string>) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (stuitemid: string) =>
        useDelete<StudentItemResp[]>(addPreUrl(`studentitems/${stuitemid}`)),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  //
  static addStudentItemService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (stuItem: StudentItem) =>
        usePost<StudentItemResp[]>(addPreUrl(`studentitems`), stuItem),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  //
  private static async _uploadStudentItemFileService(fdata: FormData, stuitemid: string) {
    const uploadFile = fdata.get('uploadFile')
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

  static uploadStudentItemFileService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async ({ fdata, stuitemid }: { fdata: FormData; stuitemid: string }) =>
        await StudentService._uploadStudentItemFileService(fdata, stuitemid),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  static updateStudentItemService(rootitemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ studentItemId, stuItem }: { studentItemId: string; stuItem: StudentItem }) =>
        usePatch<StudentItemResp[]>(addPreUrl(`studentitems/${studentItemId}`), stuItem),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.student.studentitems, rootitemid] })
    })
  }

  static getStudentItemStatusesService() {
    return useQuery({
      queryKey: [querycachename.student.statuses],
      queryFn: () => useGet<StudentItemsStatusDO>(addPreUrl('statuses'))
    })
  }

  static listStudentItemLogsService(id: string) {
    return useQuery({
      queryKey: ['logs', id],
      queryFn: () => useGet<StudentItemLog[]>(addPreUrl(`logs/${id}`))
    })
  }

  //
  static getCategoryService() {
    return useQuery({
      queryKey: [querycachename.student.category],
      queryFn: () => useGet<MajorCategory>(addPreUrl('category'))
    })
  }
}

import { useDelete, useGet, usePost, usePut } from '@/axios'
import { createElLoading } from '@/components/loading'
import type {
  CategoryMajors,
  CategoryWeighting,
  College,
  ComfirmWeightedScoreReq,
  Item,
  Major,
  MajorCategory,
  RegisterUserDTO,
  StudentItem,
  StudentItemLog,
  StudentItemResp,
  StudentItemsStatusDO,
  User,
  WeightedScore
} from '@/types'
import { querycachename } from '@/vuequery/Const'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { CommonService } from './CommonService'
import { getFinalScoreUtil } from './Utils'
//
const addPreUrl = (url: string) => `college/${url}`

export class CollegeService {
  //
  static listCategoriesService() {
    return useQuery({
      queryKey: [querycachename.college.categories],
      queryFn: () => useGet<MajorCategory[]>(addPreUrl('categories'))
    })
  }
  //===================================
  // 用于学院管理员添加专业，在类别管理页面显示
  /*   static listcategoryMajorsService() {
    return useQuery({
      queryKey: [querycachename.college.categoriesmajors],
      queryFn: () => useGet<CategoryMajors[]>(addPreUrl('categories/majors'))
    })
  } */
  static listcategoryMajorsService() {
    return useQuery({
      queryKey: [querycachename.college.categoriesmajors],
      queryFn: () => useGet<CategoryMajors[]>(addPreUrl('categories/majors')),
      suspense: true // 启用suspense，当数据加载时，组件将暂停渲染，直到数据加载完成
    })
  }
  //=========================
  //添加专业
  static addMajorService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (major: Major) => usePost(addPreUrl('majors'), major),
      onSuccess: () =>
        qc.refetchQueries({
          queryKey: [querycachename.college.categoriesmajors]
        })
    })
  }
  // 移除专业
  static removeMajorService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (mid: string) => useDelete(addPreUrl(`majors/${mid}`)),
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: [querycachename.college.categoriesmajors]
        })
      }
    })
  }

  //
  static listCategoryItemsService(catid: string) {
    return useQuery({
      queryKey: [querycachename.college.categoryitems, catid],
      queryFn: () => createElLoading(useGet<Item[]>(addPreUrl(`categories/${catid}/items`)))
    })
  }

  //======================
  //=======================
  //添加指标项，有问题
  static addItemService(catid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (item: Item) => usePost<Item[]>(addPreUrl('items'), item),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.college.categoryitems, catid] })
    })
  }
  //=========================
  //===================================
  // 基于类别，加载全专业
  static listMajorsService(catidR: MaybeRefOrGetter<string>) {
    return useQuery({
      queryKey: [querycachename.college.majors, catidR],
      queryFn: () => useGet<Major[]>(addPreUrl(`categories/${toValue(catidR)}/majors`))
    })
  }
  //学生指标项状态
  static listStudentsStatusesService(
    majorid: MaybeRefOrGetter<string>,
    weighting: CategoryWeighting
  ) {
    return useQuery({
      queryKey: [querycachename.college.majorstudentstatuses, majorid],
      queryFn: () =>
        createElLoading(
          useGet<StudentItemsStatusDO[]>(addPreUrl(`majors/${toValue(majorid)}/students/statuses`))
        ),
      select: data =>
        data.sort((a, b) => {
          const finalA = getFinalScoreUtil(a.score ?? 0, a.totalPoint ?? 0, weighting)
          const finalB = getFinalScoreUtil(b.score ?? 0, b.totalPoint ?? 0, weighting)
          return finalB - finalA // 降序
        })
    })
  }

  static getStudentWeightedScoreService(sid: string) {
    return useQuery({
      queryKey: [querycachename.college.studentweightedscores, sid],
      queryFn: () => useGet<WeightedScore>(addPreUrl(`students/${sid}/weightedscore`))
    })
  }

  static updateStudentWeightedScoreService(sid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationKey: [querycachename.college.studentweightedscores, sid],
      mutationFn: ({ sid, req }: { sid: string; req: ComfirmWeightedScoreReq }) =>
        usePost<WeightedScore>(addPreUrl(`students/${sid}/weightedscore`), req),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.college.studentweightedscores, sid] })
    })
  }

  //
  static listStudentItemsService(sid: string) {
    return useQuery({
      queryKey: [querycachename.college.studentitems, sid],
      queryFn: () =>
        createElLoading(useGet<StudentItemResp[]>(addPreUrl(`students/${sid}/studentitems`)))
    })
  }

  //
  static updateStudentItemSercice(sid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationKey: [querycachename.college.studentitems, sid],
      mutationFn: ({
        sid,
        stuItem,
        log
      }: {
        sid: string
        stuItem: StudentItem
        log: StudentItemLog
      }) => {
        return usePost<StudentItemResp[]>(addPreUrl(`students/${sid}/studentitems`), {
          studentItem: stuItem,
          log
        })
      },
      onSuccess: () =>
        qc.refetchQueries({
          queryKey: [querycachename.college.studentitems, sid]
        })
    })
  }
  /*
  static async downloadFileService(sfile: string, fileName: string) {
    const result = CommonService.downloadFile(addPreUrl(`studentitems/files/${sfile}`), fileName)
  }
*/
  static async downloadFileService(sfile: string, fileName: string) {
    await CommonService.downloadFile(addPreUrl(`studentitems/files/${sfile}`), fileName)
  }
  //
  static addAdminService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (user: RegisterUserDTO) => usePost(addPreUrl('users'), user),
      onSuccess: () => qc.refetchQueries({ queryKey: [querycachename.college.counselors] })
    })
  }

  static listCounselorsService() {
    return useQuery({
      queryKey: [querycachename.college.counselors],
      queryFn: () =>
        useGet<
          {
            majorCategory?: MajorCategory
            users?: User[]
          }[]
        >(addPreUrl('categories/users'))
    })
  }

  // 添加类别（似乎是没有问题）
  static addCategoryService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (cat: MajorCategory) => usePost(addPreUrl('categories'), cat),
      onSuccess: () => {
        qc.refetchQueries({
          queryKey: [querycachename.college.categories]
        })

        qc.refetchQueries({
          queryKey: [querycachename.college.categoriesmajors]
        })
      }
    })
  }

  // 移除类别
  static removeCategoryService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (mcid: string) => useDelete(addPreUrl(`categories/${mcid}`)),
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: [querycachename.college.categories]
        })
      }
    })
  }

  //=================================
  static getCategoryWeightingService = (catid: string) => {
    return CollegeService.listCategoriesService().data.value?.find(cat => cat.id === catid)
      ?.weighting
  }

  // 更新密码
  static async updatePasswordService(account: string) {
    await usePut(addPreUrl(`passwords/${account}`))
  }
  //=====================================
  //添加学院
  static addCollegeService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (college: College) => usePost('admin/colleges', college),
      onSuccess: () =>
        qc.refetchQueries({
          queryKey: [querycachename.college.colleges]
        })
    })
  }
  //查看学院列表
  static listCollegeService() {
    return useQuery<College[], Error>({
      queryKey: [querycachename.college.colleges],
      queryFn: () => useGet<College[]>('open/colleges1')
    })
  }
  // 移除学院
  static removeCollegeService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => useDelete(`admin/colleges/${id}`),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.college.colleges] })
      }
    })
  }
  //======================
  //添加学院管理员
  static addCollegeAdminService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (user: User) => usePost('admin/users', user),
      onSuccess: () =>
        qc.refetchQueries({
          queryKey: [querycachename.college.collegeadmin]
        })
    })
  }

  // 移除学院管理员
  static removeCollegeAdminService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (uid: string) => useDelete(`admin/users/${uid}`),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [querycachename.college.collegeadmin] })
      }
    })
  }

  // 查看指定学院的管理员列表（后端接口 /admin/users/{cid}）
  static listCollegeAdminsService(collegeId: string) {
    return useQuery<
      Array<{
        id: string
        name: string
        account: string
        tel: string
      }>,
      Error
    >({
      queryKey: [querycachename.college.collegeadmin],
      queryFn: () => useGet(`admin/users/${collegeId}`)
    })
  }
  //加载学院名称
  static listCollegeByIdService(collegeId: string) {
    return useQuery<College, Error>({
      queryKey: ['colleges', collegeId],
      queryFn: () => useGet(`open/colleges/${collegeId}`)
    })
  }
}

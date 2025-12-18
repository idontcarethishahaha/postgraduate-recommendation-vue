import { useDelete, useGet, usePost, usePut } from '@/axios'
import { createElLoading } from '@/components/loading'
import type {
  CategoryCounselors,
  CategoryMajors,
  CategoryWeighting,
  College,
  ComfirmWeightedScoreReq,
  CounselorDTO,
  Item,
  Major,
  MajorCategory,
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

//统一拼接接口前缀
const addPreUrl = (url: string) => `college/${url}`

//所有接口封装为静态类方法，无需实例化，直接调用
export class CollegeService {
  //类别列表
  static listCategoriesService() {
    return useQuery({
      queryKey: [querycachename.college.categories],
      queryFn: () => useGet<MajorCategory[]>(addPreUrl('categories'))
    })
  }
  //类别-专业列表
  static listcategoryMajorsService() {
    return useQuery({
      queryKey: [querycachename.college.categoriesmajors],
      queryFn: () => useGet<CategoryMajors[]>(addPreUrl('categories/majors')),
      suspense: true // 启用suspense，当数据加载时，组件将暂停渲染，直到数据加载完成
    })
  }

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

  //加载类别下指标项
  static listCategoryItemsService(catid: string) {
    return useQuery({
      queryKey: [querycachename.college.categoryitems, catid],
      queryFn: () => createElLoading(useGet<Item[]>(addPreUrl(`categories/${catid}/items`)))
    })
  }

  //添加指标项
  static addItemService(catid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (item: Item) => usePost<Item[]>(addPreUrl('items'), item),
      onSuccess: () =>
        qc.refetchQueries({ queryKey: [querycachename.college.categoryitems, catid] })
    })
  }
  //refetchQueries,立即重新获取数据
  //invalidateQueries,查询键失效，下次获取数据时重新请求
  //移除指标项
  static removeItemService(itemid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: () => useDelete(addPreUrl(`items/${itemid}`)),
      onSuccess: () => {
        /* qc.invalidateQueries({
          queryKey: [querycachename.college.categoryitems]
        }) */
        qc.refetchQueries({
          queryKey: [querycachename.college.categoryitems]
        })
      }
    })
  }

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
        //数据较多，请求中显示加载动画
        createElLoading(
          //将「响应式值 / 取值函数」转为普通值（如 toValue(ref('123')) → '123'）
          useGet<StudentItemsStatusDO[]>(addPreUrl(`majors/${toValue(majorid)}/students/statuses`))
        ),
      //组件直接用排序后的数据
      select: data =>
        data.sort((a, b) => {
          //按最终成绩降序排序
          const finalA = getFinalScoreUtil(a.score ?? 0, a.totalPoint ?? 0, weighting)
          const finalB = getFinalScoreUtil(b.score ?? 0, b.totalPoint ?? 0, weighting)
          return finalB - finalA
        })
    })
  }

  // 获取学生加权分数
  static getStudentWeightedScoreService(sid: string) {
    return useQuery({
      queryKey: [querycachename.college.studentweightedscores, sid],
      queryFn: () => useGet<WeightedScore>(addPreUrl(`students/${sid}/weightedscore`))
    })
  }

  // 修改学生加权分数
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

  // 获取学生提交指标项
  static listStudentItemsService(sid: string) {
    return useQuery({
      queryKey: [querycachename.college.studentitems, sid],
      queryFn: () =>
        createElLoading(useGet<StudentItemResp[]>(addPreUrl(`students/${sid}/studentitems`)))
    })
  }
  //=================================
  // 审核人修改学生的指标项信息
  static updateStudentItemSercice(sid: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationKey: [querycachename.college.studentitems, sid],
      mutationFn: ({
        sid,
        stuItem, // 要修改的学生指标项数据
        log // 操作日志
      }: {
        sid: string
        stuItem: StudentItem
        log: StudentItemLog
      }) => {
        //返回修改后的学生指标项列表
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
  // 下载文件
  static async downloadFileService(sfile: string, fileName: string) {
    await CommonService.downloadFile(addPreUrl(`studentitems/files/${sfile}`), fileName)
  }
  //============================

  //添加辅导员
  static addCounselorService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (user: CounselorDTO) => usePost(addPreUrl('users'), user),
      onSuccess: () => qc.refetchQueries({ queryKey: [querycachename.college.counselors] })
    })
  }
  // 移除辅导员
  static removeCounselorService() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (uid: string) => useDelete(`college/users/${uid}`),
      onSuccess: () => {
        /*     qc.invalidateQueries({ queryKey: [querycachename.college.collegeadmin] }) */
        qc.refetchQueries({ queryKey: [querycachename.college.collegeadmin] })
      }
    })
  }

  // 获取辅导员列表
  static listCounselorsService() {
    return useQuery({
      queryKey: [querycachename.college.counselors],
      queryFn: () => useGet<CategoryCounselors[]>(addPreUrl('categories/users'))
    })
  }
  //================================================
  // 添加类别，成功则重新请求类别列表&专业列表
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
  // 获取指定专业类别权重配置
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

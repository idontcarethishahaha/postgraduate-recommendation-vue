export enum StudentItemStatus {
  PENDING_REVIEW = '待提交', // 待审核
  REJECTED = '已驳回', // 已驳回
  CONFIRMED = '已认定', // 已认定
  PENDING_MODIFICATION = '待修改' // 待修改
}

//审核状态  weighted_score 表 verified
export enum VerifiedStatus {
  UNVERIFIED = 0, // 未审核
  VERIFIED = 1 // 已审核
}

export interface User {
  id?: string
  name?: string
  account?: string
  password?: string
  tel?: string
  collegeId?: string
  majorCategoryId?: string
  majorCategoryIds?: string[]
  majorId?: string
  role?: string
  createTime?: string
  updateTime?: string
}

//用户注册DTO
export interface RegisterUserDTO {
  name?: string
  account?: string
  tel?: string
  collegeId?: string
  majorId?: string
  //majorCategoryIds?: string[]
  majorCategoryId?: string
}

//用户信息VO
export interface UserInfo {
  name: string
  collegeName?: string
  majorName?: string
  categories?: string[] // 所属专业类别名称列表
}

//major_category 表
export interface CategoryWeighting {
  score: number
  compositeScore: number
  //ruleName?: string
  //weightScore?: number
}

export interface College {
  id?: string
  name?: string
  createTime?: string
  updateTime?: string
}

//专业类别
export interface MajorCategory {
  id?: string
  name?: string
  collegeId?: string
  comment?: string // 备注
  weighting?: CategoryWeighting
  deadLineTime?: Date
  createTime?: string
  updateTime?: string
}

// 添加辅导员DTO
export interface CounselorDTO {
  account: string
  name: string
  tel?: string
  collegeId?: string
  majorCategoryId?: string
}

//专业表 - major
export interface Major {
  id?: string
  name?: string // 专业名称
  majorCategoryId?: string
  collegeId?: string
  createTime?: string
  updateTime?: string
}

//类别+专业关联VO
export interface CategoryMajors {
  majorCategory?: MajorCategory
  majors?: Major[] // 该类别下的专业列表
}

//加权得分表
export interface WeightedScore {
  id?: string
  score?: number // 得分
  ranking?: number // 排名
  comment?: string // 备注
  verified?: number
  createTime?: string
  updateTime?: string
}

//评分日志
export interface WeightedScoreLog {
  id?: string
  studentId?: string
  userId?: string
  userName?: string // 评分人
  comment?: string // 备注
  createTime?: string
}

//提交加权分请求
export interface ComfirmWeightedScoreReq {
  weightedScore?: WeightedScore
  log?: WeightedScoreLog // 日志
}

//指标项表
export interface Item {
  id?: string
  name?: string
  majorCategoryId?: string
  maxPoints?: number // 上限
  maxItems?: number // 限项数
  parentId?: string
  comment?: string
  items?: Item[] // 子指标列表
  createTime?: string
  updateTime?: string
}

//学生指标提交表
export interface StudentItem {
  id?: string
  userId?: string
  rootItemId?: string
  itemId?: string
  name?: string // 指标名称
  point?: number // 申请分数
  comment?: string // 备注
  status?: string
  files?: StudentItemFile[] // 附件列表
  createTime?: string
  updateTime?: string
}

//指标附件表 - student_item_file
export interface StudentItemFile {
  id?: string
  studentItemId?: string
  path?: string // 文件路径
  filename?: string // 文件名
  createTime?: string
  updateTime?: string
}

//学生指标响应VO
export interface StudentItemResp {
  id?: string
  userId?: string
  rootItemId?: string
  itemId?: string
  name?: string
  point?: number
  comment?: string
  status?: string
  itemName?: string // 指标模板名称
  maxPoints?: number // 指标上限点数
  maxItems?: number // 指标限项数
  itemParentId?: string
  itemComment?: string // 指标备注
  files?: StudentItemFile[] // 附件列表
}

//学生指标状态统计DO
export interface StudentItemsStatusDO {
  userId?: string
  userName?: string // 学生姓名
  tel?: string
  score?: number // 加权分
  ranking?: number // 排名
  verified?: number
  totalPoint?: number // 总得分
  totalCount?: number // 指标总数
  pendingReviewCount?: number // 待审核数
  rejectedCount?: number // 已驳回数
  pendingModificationCount?: number // 待修改数
  confirmedCount?: number // 已认定数
}

export interface StudentItemLog {
  id?: string
  studentItemId?: string
  userId?: string
  comment?: string // 审核备注（驳回理由等）
  createTime?: string // 审核时间
}

//统一响应体
export interface ResultVO<T = unknown> {
  code: number
  message?: string
  data: T
}

//文件上传进度
export interface Progress {
  percentage: number // 进度百分比
  rate: number // 上传速率
  total: number // 文件总大小
  loaded: number // 已上传大小
  title: string // 文件名
}

// 类别-辅导员关联VO（AdminResp后端结构）
export interface CategoryCounselors {
  majorCategory?: MajorCategory
  users?: User[]
}

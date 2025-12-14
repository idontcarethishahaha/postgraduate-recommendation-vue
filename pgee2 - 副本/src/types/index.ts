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
  tel?: string // 保留字段名，类型保持 string
  collegeId?: string // 保留字段名，类型保持 string
  catId?: string //  major_category_id
  catIds?: string[] // 用户关联的多个类别ID
  majorId?: string
  role?: string // 保留字段名，类型保持 string
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//用户注册DTO
export interface RegisterUserDTO {
  name?: string
  account?: string
  tel?: string // 保留字段名，类型保持 string
  catIds?: string[] // 保留字段名，类型保持 string[]
}

//用户信息VO
export interface UserInfo {
  name: string
  collegeName?: string // 保留字段名，类型保持 string
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
  id?: string // 保留字段名，类型保持 string
  name?: string
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//专业类别
export interface MajorCategory {
  id?: string // 保留字段名，类型保持 string
  name?: string // 类别名称
  collegeId?: string // 保留字段名，类型保持 string
  comment?: string // 备注
  weighting?: CategoryWeighting
  deadLineTime?: Date // 保留字段名，类型保持 Date
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//专业表 - major
export interface Major {
  id?: string // 保留字段名，类型保持 string
  name?: string // 专业名称
  catId?: string // 保留字段名，类型保持 string (major_category_id)
  collegeId?: string // 保留字段名，类型保持 string (college_id)
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//类别+专业关联VO
export interface CategoryMajors {
  category?: MajorCategory // 保留字段名，类型保持 MajorCategory
  majors?: Major[] // 该类别下的专业列表
}

//加权得分表
export interface WeightedScore {
  id?: string // 保留字段名，类型保持 string
  score?: number // 得分
  ranking?: number // 排名
  comment?: string // 备注
  verified?: number // 核心修改：从 VerifiedStatus 改为 number（对齐基准文件）
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//评分日志
export interface WeightedScoreLog {
  id?: string // 保留字段名，类型保持 string
  studentId?: string // 保留字段名，类型保持 string
  userId?: string // 保留字段名，类型保持 string
  userName?: string // 评分人
  comment?: string // 备注
  createTime?: string // 保留字段名，类型保持 string
}

//提交加权分请求
export interface ComfirmWeightedScoreReq {
  weightedScore?: WeightedScore
  log?: WeightedScoreLog // 日志
}

//指标项表
export interface Item {
  id?: string // 保留字段名，类型保持 string
  name?: string
  catId?: string // 保留字段名，类型保持 string (major_category_id)
  maxPoints?: number // 上限
  maxItems?: number // 限项数
  parentId?: string // 保留字段名，类型保持 string
  comment?: string
  items?: Item[] // 子指标列表
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//学生指标提交表
export interface StudentItem {
  id?: string // 保留字段名，类型保持 string
  userId?: string // 保留字段名，类型保持 string
  rootItemId?: string // 保留字段名，类型保持 string
  itemId?: string // 保留字段名，类型保持 string
  name?: string // 指标名称
  point?: number // 申请分数
  comment?: string // 备注
  status?: string // 核心修改：从 StudentItemStatus 改为 string（对齐基准文件）
  files?: StudentItemFile[] // 附件列表
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//指标附件表 - student_item_file
export interface StudentItemFile {
  id?: string // 保留字段名，类型保持 string
  studentItemId?: string // 保留字段名，类型保持 string
  path?: string // 文件路径
  filename?: string // 文件名
  createTime?: string // 保留字段名，类型保持 string
  updateTime?: string // 保留字段名，类型保持 string
}

//学生指标响应VO
export interface StudentItemResp {
  id?: string // 保留字段名，类型保持 string
  userId?: string // 保留字段名，类型保持 string
  rootItemId?: string // 保留字段名，类型保持 string
  itemId?: string // 保留字段名，类型保持 string
  name?: string
  point?: number
  comment?: string
  status?: string // 核心修改：从 StudentItemStatus 改为 string（对齐基准文件）
  itemName?: string // 指标模板名称
  maxPoints?: number // 指标上限点数
  maxItems?: number // 指标限项数
  itemParentId?: string // 保留字段名，类型保持 string
  itemComment?: string // 指标备注
  files?: StudentItemFile[] // 附件列表
}

//学生指标状态统计DO
export interface StudentItemsStatusDO {
  userId?: string // 保留字段名，类型保持 string
  userName?: string // 学生姓名
  tel?: string // 保留字段名，类型保持 string
  score?: number // 加权分
  ranking?: number // 排名
  verified?: number // 核心修改：从 VerifiedStatus 改为 number（对齐基准文件）
  totalPoint?: number // 总得分
  totalCount?: number // 指标总数
  pendingReviewCount?: number // 待审核数
  rejectedCount?: number // 已驳回数
  pendingModificationCount?: number // 待修改数
  confirmedCount?: number // 已认定数
}

export interface StudentItemLog {
  id?: string // 保留字段名，类型保持 string
  studentItemId?: string // 保留字段名，类型保持 string
  userId?: string // 保留字段名，类型保持 string
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

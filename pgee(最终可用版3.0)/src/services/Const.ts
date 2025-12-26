export const ADMIN = 'Fr5g'
export const COLLEGE_ADMIN = 'yHJ7'
export const COUNSELOR = 'Ca24'
export const STUDENT = 'dA5q'

export const PENDING_REVIEW = 'kf7u' //已提交
export const REJECTED = 'op81' //已驳回
export const PENDING_MODIFICATION = 'Tg9i' //待修改
export const CONFIRMED = 'yF2m' //已认定

export const STUDENT_ITEM_STATUS_MAP = new Map<string, { name: string; color: string }>()
STUDENT_ITEM_STATUS_MAP.set(PENDING_REVIEW, {
  name: '待审核',
  color: 'info'
})
STUDENT_ITEM_STATUS_MAP.set(REJECTED, {
  name: '已驳回',
  color: 'danger'
})
STUDENT_ITEM_STATUS_MAP.set(PENDING_MODIFICATION, {
  name: '待修改',
  color: 'warning'
})
STUDENT_ITEM_STATUS_MAP.set(CONFIRMED, {
  name: '已认定',
  color: 'success'
})

export const VERIFIED = 1
export const UNVERIFIED = 0

// 状态映射表
export const SCORE_STATUS_MAP = new Map<number, { name: string; color: string }>()
SCORE_STATUS_MAP.set(UNVERIFIED, { name: '待审核', color: 'info' })
SCORE_STATUS_MAP.set(VERIFIED, { name: '已认定', color: 'success' })

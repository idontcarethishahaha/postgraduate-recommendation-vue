import type { CategoryWeighting } from '@/types'
import { STUDENT_ITEM_STATUS_MAP } from './Const'

export const getStatusUtil = (status: string) => STUDENT_ITEM_STATUS_MAP.get(status)

//最终分数计算工具函数
export const getFinalScoreUtil = (
  score: number,
  point: number,
  weighting: CategoryWeighting = { score: 0, compositeScore: 0 } //权重配置
) =>
  (score * 100 * (weighting?.score ?? 0) + point * 100 * (weighting?.compositeScore ?? 0)) / 10000

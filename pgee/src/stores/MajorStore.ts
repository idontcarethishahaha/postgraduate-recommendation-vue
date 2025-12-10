import type { Major } from '@/types'
import { shallowRef } from 'vue'

// 专业列表（全局状态）
const majors = shallowRef<Major[]>([])

/**
 * 设置专业列表（覆盖原有数据）
 * @param newMajors 新的专业列表
 */
const setMajors = (newMajors: Major[]) => {
  majors.value = newMajors
}

/**
 * 添加单个专业（追加到列表）
 * @param major 新增的专业
 */
const addMajor = (major: Major) => {
  majors.value.push(major)
}

/**
 * 更新指定专业信息
 * @param majorId 专业ID
 * @param data 要更新的字段（仅名称）
 */
const updateMajor = (majorId: string, data: Partial<{ name: string }>) => {
  const index = majors.value.findIndex(item => item.id === majorId)
  if (index !== -1) {
    majors.value[index] = {
      ...majors.value[index],
      ...data,
      updateTime: new Date().toISOString() // 前端临时更新时间
    }
  }
}

/**
 * 删除指定专业
 * @param majorId 专业ID
 */
const removeMajor = (majorId: string) => {
  majors.value = majors.value.filter(item => item.id !== majorId)
}

/**
 * 根据专业类别ID筛选专业
 * @param categoryId 专业类别ID
 * @returns 该类别下的所有专业
 */
const getMajorsByCategoryId = (categoryId: string) => {
  return majors.value.filter(item => item.majorCategoryId === categoryId)
}

/**
 * 根据ID获取单个专业详情
 * @param majorId 专业ID
 * @returns 专业详情（无则返回空对象）
 */
const getMajorById = (majorId: string) => {
  return majors.value.find(item => item.id === majorId) || ({} as Major)
}

/**
 * 清空专业列表（删除类别/切换学院时使用）
 */
const clearMajors = () => {
  majors.value = []
}

// 暴露状态和方法
export const useMajorStore = () => ({
  majors,
  setMajors,
  addMajor,
  updateMajor,
  removeMajor,
  getMajorsByCategoryId,
  getMajorById,
  clearMajors
})

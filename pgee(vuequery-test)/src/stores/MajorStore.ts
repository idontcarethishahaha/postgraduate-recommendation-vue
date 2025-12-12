import type { Major } from '@/types'
import { shallowRef } from 'vue'

// 专业列表（全局状态）
const majors = shallowRef<Major[]>([])

const setMajors = (newMajors: Major[]) => {
  majors.value = newMajors
}

const addMajor = (major: Major) => {
  majors.value.push(major)
}

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

const removeMajor = (majorId: string) => {
  majors.value = majors.value.filter(item => item.id !== majorId)
}

const getMajorsByCategoryId = (categoryId: string) => {
  return majors.value.filter(item => item.majorCategoryId === categoryId)
}

const getMajorById = (majorId: string) => {
  return majors.value.find(item => item.id === majorId) || ({} as Major)
}

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

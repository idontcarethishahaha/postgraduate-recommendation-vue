import type { Major } from '@/types'
import { shallowRef } from 'vue'

// 专业列表
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
      updateTime: new Date().toISOString()
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

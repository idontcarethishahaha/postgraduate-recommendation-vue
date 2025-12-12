import type { MajorCategory } from '@/types'
import { shallowRef } from 'vue'

const majorCategories = shallowRef<MajorCategory[]>([])

// 设置专业类别列表
const setMajorCategories = (categories: MajorCategory[]) => {
  majorCategories.value = categories
}

// 添加专业类别
const addMajorCategory = (category: MajorCategory) => {
  majorCategories.value.push(category)
}

// 更新专业类别
const updateMajorCategory = (categoryId: string, data: Partial<MajorCategory>) => {
  const index = majorCategories.value.findIndex(c => c.id === categoryId)
  if (index !== -1) {
    majorCategories.value[index] = { ...majorCategories.value[index], ...data }
  }
}

// 删除专业类别
const removeMajorCategory = (categoryId: string) => {
  majorCategories.value = majorCategories.value.filter(c => c.id !== categoryId)
}

export const useMajorCategoryStore = () => ({
  majorCategories,
  setMajorCategories,
  addMajorCategory,
  updateMajorCategory,
  removeMajorCategory
})

import type { College } from '@/types'
import { shallowRef } from 'vue'

const collegesS = shallowRef<College[]>([])

//设置学院列表
const setColleges = (colleges: College[]): void => {
  collegesS.value = colleges
}

//添加学院到列表
const addCollege = (college: College): void => {
  collegesS.value.push(college)
}

//更新学院信息
const updateCollege = (collegeId: string, collegeData: Partial<College>): void => {
  const index = collegesS.value.findIndex(college => college.id === collegeId)
  if (index !== -1) {
    collegesS.value[index] = { ...collegesS.value[index], ...collegeData }
  }
}

//删除学院
const removeCollege = (collegeId: string): void => {
  collegesS.value = collegesS.value.filter(college => college.id !== collegeId)
}

//清空学院列表
const clearColleges = (): void => {
  collegesS.value = []
}

const store = {
  collegesS,
  setColleges,
  addCollege,
  updateCollege,
  removeCollege,
  clearColleges
}

export const useCollegeStore = () => {
  return store
}

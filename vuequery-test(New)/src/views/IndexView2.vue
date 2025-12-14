<template>
  <div>
    <VueQueryDevtools />
    <h2>学院列表</h2>
    <div>
    </div>

    <div>
      <input
        v-model="newCollegeName"
        placeholder="输入学院名称"
        style="padding: 4px; margin-right: 8px" />
      <button @click="handleAdd">添加学院</button>
    </div>

    <div v-if="collegesR?.length === 0">暂无数据</div>
    <div v-else>
      <div v-for="college of collegesR!" :key="college.id" style="margin: 8px 0">
        {{ college.name }}--{{ college.id }}
        <button @click="handleRemove(college.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CollegeService } from '@/service/CollegeService'
import type { College } from '@/types' 
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { ref } from 'vue' 


const { data: collegesR } = CollegeService.listCollegeService()
//===================================================================
//添加学院
const newCollegeName = ref('')
const addMutation = CollegeService.addCollege()

const handleAdd = async () => {
  if (!newCollegeName.value.trim()) return
  try {
    await addMutation.mutateAsync({ name: newCollegeName.value.trim() } as College)
    newCollegeName.value = ''
  } catch (error) {
    console.error('添加学院失败：', error)
  }
}



const removeMutation = CollegeService.removeCollege()

const handleRemove = async (id: string) => {
  if (!confirm('确定删除该学院吗？')) return

  await removeMutation.mutateAsync(id)
  alert('删除成功')

}
//=========================================================================
</script>

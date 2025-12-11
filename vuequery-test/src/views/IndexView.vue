<template>
  <div>
    <VueQueryDevtools />
    <h2>学院列表</h2>
    <!--添加学院-->
    <div>
      <input
        v-model="newCollegeName"
        placeholder="输入学院名称"
        style="padding: 4px; margin-right: 8px" />
      <button @click="handleAdd">
        {{ addMutation.isPending.value ? '新增中...' : '新增学院' }}
      </button>
    </div>

    <div v-if="isPending">加载中...</div>
    <div v-else-if="isError">加载失败:{{ error }}</div>
    <div v-else-if="data?.length === 0">暂无数据</div>
    <div v-else>
      <div v-for="college of data" :key="college.id" style="margin: 8px 0">
        <input
          v-model="editNameMap[college.id]"
          placeholder="编辑名称"
          style="padding: 4px; margin-right: 8px" />
        {{ college.name }}--{{ college.id }}

        <!--更新-->
        <button @click="handleUpdate(college.id)" style="margin-right: 8px">
          {{
            updateMutation.isPending.value && currentUpdateId === college.id ? '编辑中...' : '编辑'
          }}
        </button>

        <!--删除-->
        <button @click="handleDelete(college.id)">
          {{
            deleteMutation.isPending.value && currentDeleteId === college.id ? '删除中...' : '删除'
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { addCollege, deleteCollege, getAllCollege, updateCollege } from '@/service'
import type { AddCollegeRequest, College, UpdateCollegeRequest } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { reactive, ref } from 'vue'

const queryClient = useQueryClient()
const { isPending, isError, data, error } = useQuery<College[]>({
  queryKey: ['colleges'],
  queryFn: getAllCollege
})
//新增学院
const newCollegeName = ref('')
const addMutation = useMutation({
  mutationFn: (params: AddCollegeRequest) => addCollege(params),
  onSuccess: () => {
    // 新增成功：刷新列表+清空输入
    queryClient.invalidateQueries({ queryKey: ['colleges'] })
    newCollegeName.value = ''
    alert('新增成功')
  },
  onError: (err: Error) => alert(`新增失败：${err.message}`)
})
const handleAdd = () => {
  if (!newCollegeName.value.trim()) return
  addMutation.mutate({ name: newCollegeName.value.trim() })
}

//编辑学院
const editNameMap = reactive<Record<string, string>>({}) //存储各学院编辑后的名称
const currentUpdateId = ref('') //标记正在编辑的学院ID
const updateMutation = useMutation({
  mutationFn: ({ id, params }: { id: string; params: UpdateCollegeRequest }) =>
    updateCollege(id, params),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['colleges'] })
    currentUpdateId.value = ''
    alert('编辑成功')
  },
  onError: (err: Error) => alert(`编辑失败：${err.message}`)
})
const handleUpdate = (id: string) => {
  const name = editNameMap[id]?.trim()
  if (!name) return
  currentUpdateId.value = id
  updateMutation.mutate({ id, params: { name } })
}

//删除学院
const currentDeleteId = ref('') // 标记正在删除的学院ID
const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteCollege(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['colleges'] })
    currentDeleteId.value = ''
    alert('删除成功')
  },
  onError: (err: Error) => alert(`删除失败：${err.message}`)
})
const handleDelete = (id: string) => {
  if (!confirm('确定删除该学院吗？')) return
  currentDeleteId.value = id
  deleteMutation.mutate(id)
}
</script>

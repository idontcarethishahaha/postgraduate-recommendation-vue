<template>
  <div>
    <VueQueryDevtools />
    <h2>学院列表</h2>
    <div>
      <!--
      <input
        v-model="newCollegeName"
        placeholder="输入学院名称"
        style="padding: 4px; margin-right: 8px" />
      <button @click="handleAdd">
        {{ addMutation.isPending.value ? '添加中...' : '添加学院' }}
      </button>-->
    </div>

    <div>
      <input
        v-model="newCollegeName"
        placeholder="输入学院名称"
        style="padding: 4px; margin-right: 8px" />
      <button @click="handleAdd">添加学院</button>
    </div>
    <!--
    <div v-if="isPending">加载中...</div>
    <div v-else-if="isError">加载失败:{{ error }}</div>
    <div v-else-if="data?.length === 0">暂无数据</div>
    <div v-else>
      <div v-for="college of data" :key="college.id" style="margin: 8px 0">-->
    <!--
        <input
          v-model="editNameMap[college.id]"
          placeholder="输入更新名称"
          style="padding: 4px; margin-right: 8px" />-->
    <!--{{ college.name }}--{{ college.id }}-->
    <!--
        <button @click="handleUpdate(college.id)" style="margin-right: 8px">
          {{
            updateMutation.isPending.value && currentUpdateId === college.id ? '更新中...' : '更新'
          }}
        </button>-->
    <!--
        <button @click="handleRemove(college.id)">
          {{
            removeMutation.isPending.value && currentRemoveId === college.id ? '删除中...' : '删除'
          }}
        </button>-->

    <!--<button @click="handleRemove(college.id)">删除</button>
      </div>
    </div>
  </div>-->

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
//import { addCollege, getAllCollege, removeCollege, updateCollege } from '@/service'
//import { getAllCollege } from '@/service' // removeCollege, updateCollege
//import type { AddCollegeRequest, College, UpdateCollegeRequest } from '@/types'
import { CollegeService } from '@/service/CollegeService'
import type { College } from '@/types' //, UpdateCollegeRequest
//import { useQuery } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { ref } from 'vue' // reactive,

//const queryClient = useQueryClient()

// 查询所有学院
/*
const { isPending, isError, data, error } = useQuery<College[]>({
  queryKey: ['colleges'],
  queryFn: getAllCollege
})
*/
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

//========================================================================

/*
const newCollegeName = ref('')
const addMutation = useMutation({
  mutationFn: (params: AddCollegeRequest) => addCollege(params),
  onSuccess: () => {
    // 成功，刷新列表,清空输入
    queryClient.invalidateQueries({ queryKey: ['colleges'] })
    newCollegeName.value = ''
    alert('添加成功')
  },
  onError: (err: Error) => alert(`添加失败：${err.message}`)
})
const handleAdd = () => {
  if (!newCollegeName.value.trim()) return
  addMutation.mutate({ name: newCollegeName.value.trim() })
}
*/
/*
//更新学院名   Record<K,V>  K是key的类型，V是value的类型
const editNameMap = reactive<Record<string, string>>({}) //存更新后名称
const currentUpdateId = ref('')
const updateMutation = useMutation({
  mutationFn: ({ id, params }: { id: string; params: UpdateCollegeRequest }) =>
    updateCollege(id, params),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['colleges'] })
    currentUpdateId.value = ''
    alert('更新成功')
  },
  onError: (err: Error) => alert(`更新失败：${err.message}`)
})
const handleUpdate = (id: string) => {
  //从editNameMap中取当前学院更新后名称
  const name = editNameMap[id]?.trim()
  if (!name) return
  currentUpdateId.value = id //标记正在更新学院id

  updateMutation.mutate({ id, params: { name } })

  //清空输入框
  //editNameMap[id] = ''
}*/
//======================================================================
//删除学院
/*
const currentRemoveId = ref('')
const removeMutation = useMutation({
  mutationFn: (id: string) => removeCollege(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['colleges'] })
    currentRemoveId.value = ''
    alert('删除成功')
  },
  onError: (err: Error) => alert(`删除失败：${err.message}`)
})
const handleRemove = (id: string) => {
  if (!confirm('确定删除该学院吗？')) return
  currentRemoveId.value = id
  removeMutation.mutate(id)
}*/

const removeMutation = CollegeService.removeCollege()

const handleRemove = async (id: string) => {
  if (!confirm('确定删除该学院吗？')) return

  //try {
  await removeMutation.mutateAsync(id)
  alert('删除成功')
  //} catch (error) {
  // console.error('删除学院失败：', error)
  // alert(`删除失败：${(error as Error).message || '未知错误'}`)
  //}
}
//=========================================================================
</script>

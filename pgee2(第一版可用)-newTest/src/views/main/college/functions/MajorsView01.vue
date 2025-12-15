<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { Major } from '@/types'
import { computed, onMounted, ref, watch } from 'vue'

// 接收父组件传递的类别ID
const props = defineProps<{
  categoryId: string // 当前激活的类别ID
}>()

const searchKeywordR = ref('')
const majors = ref<Major[]>([])

// 加载指定类别的专业
const { data: majorsR, refetch: refetchMajors } = CollegeService.listMajorsService(props.categoryId)

// 移除专业
const { mutateAsync: removeMajorMutate } = CollegeService.removeMajorService()

const filteredMajors = computed(() => {
  if (!searchKeywordR.value) return majors.value
  const keyword = searchKeywordR.value.toLowerCase()
  return majors.value.filter(item => item.name?.toLowerCase().includes(keyword))
})

// 加载专业
const loadMajors = async () => {
  if (!props.categoryId) return
  await refetchMajors()
  majors.value = majorsR.value || []
}

// 类别ID变化，重新加载专业列表
watch([() => props.categoryId], loadMajors, { immediate: true })
onMounted(loadMajors)

// 移除专业
const handleRemoveMajor = async (mid: string) => {
  if (!confirm('确定移除该专业吗？')) return
  await removeMajorMutate(mid)
  createElNotificationSuccess('专业移除成功')
  loadMajors() // 刷新列表
}

// 搜索专业（触发重新过滤）
const searchMajors = () => {}
</script>

<template>
  <div class="majors-manage-page">
    <div
      class="search-bar"
      style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem">
      <el-input
        v-model="searchKeywordR"
        placeholder="搜索专业名称..."
        style="width: 200px"
        clearable
        @keypress.enter="searchMajors" />
      <el-button type="default" @click="searchMajors">搜索</el-button>
      <el-button type="default" @click="loadMajors">刷新</el-button>
    </div>

    <el-table
      v-if="filteredMajors.length"
      :data="filteredMajors"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa' }">
      <el-table-column
        label="专业名称"
        prop="name"
        min-width="200"
        align="center"
        :formatter="(row: Major) => row.name || '未知专业'" />

      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-button
            type="danger"
            text
            class="remove-btn"
            @click="handleRemoveMajor(scope.row.id)"
            :disabled="!scope.row.id">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="empty-state" style="text-align: center; padding: 3rem; color: #666">
      <h3>暂无专业数据</h3>
      <p>当前类别下还未添加专业</p>
    </div>
  </div>
</template>

<style scoped>
.remove-btn {
  color: #ff4d4f;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #303133;
}

.empty-state p {
  margin: 0;
  color: #909399;
}

:deep(.el-table__row) {
  height: 50px;
}

:deep(.el-button--text) {
  padding: 0 8px;
  &:hover {
    background-color: #f5f5f5;
    border-radius: 4px;
  }
}
</style>

<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { User } from '@/types'
import { computed, onMounted, ref, watch } from 'vue'

// 接收父组件传递的参数
const props = defineProps<{
  categoryId: string // 类别ID
  categoryName: string // 类别名称
}>()

// 定义关闭事件
const emit = defineEmits<{
  (e: 'close'): void
}>()

const loading = ref(false)

// 拉取辅导员列表
const { data: counselorsR, refetch: refetchCounselors } = CollegeService.listCounselorsService()

// 筛选当前类别下的辅导员
const currentCategoryCounselors = computed(() => {
  if (!props.categoryId || !counselorsR.value) return []

  // 从返回数据中匹配当前类别
  const targetItem = (
    counselorsR.value as Array<{
      majorCategory?: { id?: string; name?: string }
      users?: User[]
    }>
  ).find(item => item.majorCategory?.id === props.categoryId)

  return targetItem?.users || []
})

// 加载辅导员数据
const loadCounselors = async () => {
  if (!props.categoryId) return
  loading.value = true
  try {
    await refetchCounselors()
  } finally {
    loading.value = false
  }
}

// 监听类别ID变化
watch([() => props.categoryId], loadCounselors, { immediate: true })
onMounted(loadCounselors)

// 关闭弹窗
const close = () => {
  emit('close')
}
</script>

<template>
  <div class="counselors-manage-page">
    <!-- 使用父组件传递的类别名称 -->
    <div style="margin-bottom: 16px; font-size: 16px; font-weight: 600; color: #303133">
      当前类别：{{ props.categoryName || '未知类别' }}
    </div>

    <el-table
      v-loading="loading"
      :data="currentCategoryCounselors"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa' }">
      <el-table-column label="辅导员姓名" min-width="200" align="center">
        <template #default="scope">
          {{ scope.row.name || '未知姓名' }}
        </template>
      </el-table-column>

      <el-table-column label="辅导员id" min-width="200" align="center">
        <template #default="scope">
          {{ scope.row.id || '未知id' }}
        </template>
      </el-table-column>
    </el-table>

    <div
      v-if="!loading && currentCategoryCounselors.length === 0"
      class="empty-state"
      style="text-align: center; padding: 3rem; color: #666">
      <h3>该类别下暂无辅导员</h3>
      <p>请返回添加辅导员页面为【{{ props.categoryName }}】类别添加辅导员</p>
    </div>

    <div style="text-align: right; margin-top: 20px">
      <el-button @click="close" type="default">关闭</el-button>
    </div>
  </div>
</template>

<style scoped>
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
</style>

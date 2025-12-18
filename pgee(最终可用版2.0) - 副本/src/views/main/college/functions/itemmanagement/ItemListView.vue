<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { Item, MajorCategory } from '@/types'
import ItemNode from '@/views/main/college/functions/itemmanagement/ItemNode.vue'
import { Document, Plus, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { defineAsyncComponent, getCurrentInstance, h, ref, render } from 'vue'

const props = defineProps<{ category: MajorCategory }>()

const itemsR = ref<Item[] | undefined>() // 存储接口返回的指标数据
const loadError = ref<Error | null>(null) // 存储加载错误信息
const isLoading = ref(true)
const instance = getCurrentInstance()

// 筛选顶级指标
const getTopItems = (): Item[] => {
  const allItems = itemsR.value ?? []
  return allItems.filter(i => !i.parentId || i.parentId === '0' || i.parentId === '')
}

// 加载数据方法
const loadItems = async () => {
  isLoading.value = true
  loadError.value = null
  try {
    const { data, suspense } = CollegeService.listCategoryItemsService(props.category.id ?? '')
    await suspense()
    itemsR.value = data.value
    ElMessage.success('数据加载成功！')
  } finally {
    isLoading.value = false
  }
}

;(async () => {
  await loadItems()
})()

const activeAddTopItemDialogF = (e: MouseEvent) => {
  e.stopPropagation()
  if (!instance) return

  const node = h(
    defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/TopItemDialog.vue')
    ),
    {
      category: props.category,
      parentItem: {} as Item
    }
  )
  node.appContext = instance.appContext
  render(node, document.body)
}
</script>

<template>
  <div class="item-management-container">
    <div class="category-header">
      <div class="category-info">
        <h3 class="category-name">{{ props.category.name }}</h3>
        <span class="category-id">ID: {{ props.category.id }}</span>
      </div>

      <el-button
        size="small"
        type="primary"
        @click="activeAddTopItemDialogF($event)"
        class="add-btn"
        :icon="Plus">
        添加指标
      </el-button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <el-loading-spinner></el-loading-spinner>
      <p>正在加载指标项...</p>
    </div>

    <div v-else-if="loadError" class="error-state">
      <el-icon color="#ff4d4f" class="error-icon"><WarningFilled /></el-icon>
      <p>加载失败: {{ loadError.message || '未知错误' }}</p>
    </div>

    <div v-else-if="getTopItems().length === 0" class="empty-state">
      <el-icon color="#c0c4cc" class="empty-icon"><Document /></el-icon>
      <div class="empty-text">
        <p>该类别下暂无顶级指标项</p>
        <p class="hint-text">点击"添加指标"按钮创建第一个指标项</p>
      </div>
    </div>

    <!-- 指标列表 -->
    <div v-else class="items-list">
      <div class="items-list__container">
        <ItemNode
          v-for="item of getTopItems()"
          :item="item"
          :key="`item-${item.id}`"
          class="top-item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-management-container {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-name {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #1f2329;
}

.category-id {
  font-size: 13px;
  color: #86909c;
  background-color: #f2f3f5;
  padding: 2px 8px;
  border-radius: 12px;
}

.add-btn {
  transition: all 0.2s;
}

.add-btn:hover {
  transform: translateY(-2px);
}

.add-btn:active {
  transform: translateY(0);
}

.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #86909c;
}

.loading-state p {
  margin-top: 12px;
  font-size: 14px;
}

.error-state {
  text-align: center;
  padding: 40px 0;
  color: #ff4d4f;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #ffebe9;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  background-color: #fff;
  border-radius: 6px;
  border: 1px dashed #e5e6eb;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text p {
  margin: 0;
  color: #86909c;
}

.empty-text .hint-text {
  margin-top: 8px;
  font-size: 13px;
  color: #c9cdd4;
}

.items-list {
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.items-list__container {
  padding: 10px 20px;
}

.top-item {
  margin: 10px 0;
  transition: background-color 0.2s;
}

.top-item:hover {
  background-color: #fafafa;
}
</style>

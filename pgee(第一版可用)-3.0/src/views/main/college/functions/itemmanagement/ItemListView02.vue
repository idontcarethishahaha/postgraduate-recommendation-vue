<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { Item, MajorCategory } from '@/types'
import { Plus } from '@element-plus/icons-vue'
import { defineAsyncComponent, getCurrentInstance, h, ref, render } from 'vue'
import ItemNode from './ItemNode.vue' // 引入子组件

// 接收父组件传入的类别
const props = defineProps<{ category: MajorCategory }>()

// 状态管理
const itemsR = ref<Item[] | undefined>() // 存储指标数据
const loadError = ref<Error | null>(null) // 错误信息
const isLoading = ref(true) // 加载状态

// 筛选顶级指标（无父级的指标）
const getTopItems = (): Item[] => {
  const allItems = itemsR.value ?? []
  return allItems.filter(i => !i.parentId || i.parentId === '0' || i.parentId === '')
}

// 打开添加指标对话框（支持传入父级指标）
const openAddDialog = (parentItem: Item) => {
  const instance = getCurrentInstance()
  if (!instance) return

  // 渲染添加对话框
  const node = h(
    defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/ItemDialog.vue')
    ),
    {
      parentItem,
      category: props.category,
      // 对话框关闭后重新加载数据（假设对话框有close事件）
      onClose: () => {
        loadItems()
      }
    }
  )
  node.appContext = instance.appContext
  render(node, document.body)
}

// 加载指标数据
const loadItems = async () => {
  isLoading.value = true
  try {
    const { data, suspense } = CollegeService.listCategoryItemsService(props.category.id ?? '')
    await suspense()
    itemsR.value = data.value
  } catch (error) {
    loadError.value = error as Error
  } finally {
    isLoading.value = false
  }
}

// 初始加载数据
loadItems()
</script>

<template>
  <div class="item-management-container">
    <!-- 根类别标题（可点击添加顶级指标） -->
    <div class="category-root" @click="openAddDialog({})">
      <div class="root-content">
        <h3 class="root-name">{{ props.category.name }}</h3>
        <span class="root-id">ID: {{ props.category.id }}</span>
      </div>
      <el-icon class="add-icon"><Plus /></el-icon>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="state-indicator loading">
      <el-loading-spinner></el-loading-spinner>
      <p>加载指标中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="loadError" class="state-indicator error">
      <el-icon color="#ff4d4f"><WarningFilled /></el-icon>
      <p>加载失败: {{ loadError.message || '未知错误' }}</p>
      <el-button size="mini" @click="loadItems">重试</el-button>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="getTopItems().length === 0" class="state-indicator empty">
      <el-icon color="#c0c4cc"><Document /></el-icon>
      <p>暂无指标项</p>
      <p class="hint">点击上方类别添加第一个指标</p>
    </div>

    <!-- 指标列表（递归渲染） -->
    <div v-else class="items-container">
      <ItemNode v-for="item of getTopItems()" :item="item" :key="item.id" :on-add="openAddDialog" />
    </div>
  </div>
</template>

<style scoped>
.item-management-container {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 根类别样式（可点击添加顶级指标） */
.category-root {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: #f8fafc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px dashed #e2e8f0;
  margin-bottom: 20px;
}

.category-root:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.root-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.root-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.root-id {
  font-size: 12px;
  color: #64748b;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  border-radius: 12px;
}

.add-icon {
  color: #64748b;
  font-size: 18px;
  transition: all 0.2s;
}

.category-root:hover .add-icon {
  color: #3b82f6;
  transform: scale(1.1);
}

/* 状态指示器通用样式 */
.state-indicator {
  text-align: center;
  padding: 40px 20px;
  border-radius: 6px;
  margin-top: 10px;
}

.state-indicator p {
  margin: 12px 0 0;
  font-size: 14px;
}

/* 加载状态 */
.loading {
  color: #94a3b8;
  background-color: #f8fafc;
}

/* 错误状态 */
.error {
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
}

.error .el-button {
  margin-top: 16px;
}

/* 空状态 */
.empty {
  color: #94a3b8;
  background-color: #f8fafc;
  border: 1px dashed #e2e8f0;
}

.empty .hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
}

/* 指标容器 */
.items-container {
  margin-top: 10px;
  padding-left: 16px;
  border-left: 2px solid #e2e8f0;
}
</style>

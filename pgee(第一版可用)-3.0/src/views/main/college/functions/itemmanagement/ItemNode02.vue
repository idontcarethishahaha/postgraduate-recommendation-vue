<script setup lang="ts">
import type { Item } from '@/types'
import { Plus } from '@element-plus/icons-vue'
import { defineAsyncComponent, getCurrentInstance, h, ref, render, toRef } from 'vue'

const props = defineProps<{ item: Item }>()
const childrenItemsR = toRef(() => props.item.items ?? [])
const isExpanded = ref(false)
const instance = getCurrentInstance()

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const activeAddItemDialogF = (e: MouseEvent) => {
  e.stopPropagation()
  if (!instance) return

  const node = h(
    defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/ItemDialog.vue')
    ),
    { parentItem: props.item }
  )
  node.appContext = instance.appContext
  render(node, document.body)
}
</script>

<template>
  <div class="accordion-item">
    <div class="item-header" @click="toggleExpand">
      <el-icon class="expand-icon" :class="{ rotated: isExpanded }">
        <ChevronRight v-if="!isExpanded" />
        <ChevronDown v-else />
      </el-icon>

      <!-- 指标名称和分数 -->
      <div class="item-info">
        <el-text type="primary" size="large">{{ props.item.name }}</el-text>
        <el-text type="secondary" class="item-points">({{ props.item.maxPoints }}分)</el-text>
      </div>

      <!-- 添加子指标按钮 -->
      <el-icon class="add-icon" @click="activeAddItemDialogF">
        <Plus />
      </el-icon>
    </div>

    <!-- 子指标列表（手风琴） -->
    <div
      class="children-container"
      v-if="childrenItemsR.length > 0"
      :class="{ expanded: isExpanded }">
      <ItemNode v-for="ch of childrenItemsR" :key="ch.id" :item="ch" />
    </div>
  </div>
</template>

<style scoped>
.accordion-item {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.item-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.item-header:hover {
  background-color: #f5f7fa;
}

.expand-icon {
  color: #909399;
  font-size: 16px;
  margin-right: 12px;
  transition: transform 0.2s;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

.item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-points {
  font-size: 13px;
}

.add-icon {
  color: #67c23a;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.add-icon:hover {
  background-color: #f0f9eb;
  transform: scale(1.1);
}

.children-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background-color: #fafafa;
}

.children-container.expanded {
  max-height: 1000px;
  transition: max-height 0.5s ease-in;
  padding-left: 44px;
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>

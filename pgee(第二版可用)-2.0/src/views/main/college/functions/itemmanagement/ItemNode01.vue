<script setup lang="ts">
import type { Item } from '@/types'
import { CaretRight } from '@element-plus/icons-vue'
import { defineAsyncComponent, getCurrentInstance, h, ref, render, toRef } from 'vue'

const props = defineProps<{ item: Item }>()
const childrenItemsR = toRef(() => props.item.items ?? [])
const isExpanded = ref(false)
const instance = getCurrentInstance()

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const activeAddItemDialogF = (e: MouseEvent) => {
  e.stopPropagation() // 阻止事件冒泡到展开/折叠逻辑
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
      <!-- 展开/折叠图标 -->
      <el-icon class="expand-icon" :class="{ rotated: isExpanded }">
        <CaretRight v-if="!isExpanded" />
        <CaretDown v-else />
      </el-icon>

      <!-- 指标名称和分数 -->
      <div class="item-info">
        <el-text type="primary" size="large">{{ props.item.name }}</el-text>
        <el-text type="secondary" class="item-points">({{ props.item.maxPoints }}分)</el-text>
      </div>

      <!-- 添加子指标 -->
      <el-button size="mini" class="add-btn" @click="activeAddItemDialogF">添加子指标</el-button>
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

.add-btn {
  background-color: #4096ff;
  color: #ffffff;
  border: none;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background-color: #6aa8ff; /*  hover时浅一点的蓝色 */
  transform: translateY(-1px);
}

.add-btn:active {
  transform: translateY(0);
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

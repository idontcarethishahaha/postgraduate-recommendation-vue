<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { Item } from '@/types'
import { CaretRight, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { defineAsyncComponent, getCurrentInstance, h, ref, render, toRef } from 'vue'

const props = defineProps<{ item: Item }>()
const childrenItemsR = toRef(() => props.item.items ?? [])
const isExpanded = ref(false)
const instance = getCurrentInstance()

const removeMutation = CollegeService.removeItemService(props.item.id!)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 添加子指标
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

// 移除
const removeItemF = async (e: MouseEvent) => {
  e.stopPropagation()
  if (!props.item.id) return

  try {
    await ElMessageBox.confirm('确定要移除该指标项吗？此操作不可恢复！', '移除确认', {
      type: 'warning'
    })
    await removeMutation.mutateAsync()
    ElMessage.success('指标项移除成功！')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败，请重试！')
      console.error('移除指标失败：', error)
    }
  }
}
</script>

<template>
  <div class="accordion-item">
    <div class="item-header" @click="toggleExpand">
      <el-icon class="expand-icon" :class="{ rotated: isExpanded }">
        <CaretRight v-if="!isExpanded" />
        <CaretDown v-else />
      </el-icon>

      <div class="item-info">
        <el-text type="primary" size="large">{{ props.item.name }}</el-text>
        <el-text type="secondary" class="item-points">({{ props.item.maxPoints }}分)</el-text>
      </div>

      <div class="item-actions">
        <el-button size="mini" class="add-btn" @click="activeAddItemDialogF">添加子指标</el-button>
        <el-button size="mini" class="remove-btn" @click="removeItemF" :icon="Delete">
          移除指标
        </el-button>
      </div>
    </div>

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

.item-actions {
  display: flex;
  gap: 8px;
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
  background-color: #6aa8ff;
  transform: translateY(-1px);
}

.add-btn:active {
  transform: translateY(0);
}

.remove-btn {
  background-color: #ff4d4f;
  color: #ffffff;
  border: none;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background-color: #ff7875;
  transform: translateY(-1px);
}

.remove-btn:active {
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

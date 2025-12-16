<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { Item, MajorCategory } from '@/types'
import ItemNode from '@/views/main/college/functions/itemmanagement/ItemNode.vue'
import { defineAsyncComponent, getCurrentInstance, h, ref, render } from 'vue'

// 接收父组件传入的类别
const props = defineProps<{ category: MajorCategory }>()

const itemsR = ref<Item[] | undefined>() // 存储接口返回的指标数据
const loadError = ref<Error | null>(null) // 存储加载错误信息
const isLoading = ref(true)

console.log('===== 接收的类别信息 =====')
console.log('类别ID:', props.category.id)
console.log('类别名称:', props.category.name)
console.log('是否存在类别ID:', !!props.category.id)

// 筛选顶级指标
const getTopItems = (): Item[] => {
  const allItems = itemsR.value ?? []
  console.log(
    '所有指标的parentId:',
    allItems.map(i => ({ id: i.id, parentId: i.parentId }))
  )

  // 筛选parentId为空、0或空字符串的顶级指标
  const topItems = allItems.filter(i => !i.parentId || i.parentId === '0' || i.parentId === '')
  console.log('筛选出的顶级指标:', topItems)
  return topItems
}

// 打开添加指标对话框
const activeAddItemDialogF = () => {
  console.log('===== 点击添加指标 =====')
  console.log('当前选中的类别:', props.category.name)
  const instance = getCurrentInstance()
  if (!instance) {
    console.error('无法获取组件实例，添加对话框可能无法正常渲染')
    return
  }

  const node = h(
    defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/ItemDialog.vue')
    ),
    { parentItem: {}, category: props.category }
  )
  node.appContext = instance.appContext
  render(node, document.body)
  console.log('添加对话框已渲染到页面')
}

console.log('===== 开始加载指标项 =====')
console.log('请求的类别ID:', props.category.id ?? '无ID(为空)')

try {
  // 调用接口
  const { data, suspense } = CollegeService.listCategoryItemsService(props.category.id ?? '')
  await suspense()
  itemsR.value = data.value
  console.log('===== 指标项加载完成 =====')
  console.log('接口返回的原始指标数据:', itemsR.value)
  console.log('指标项总数:', itemsR.value?.length ?? 0)
} finally {
  isLoading.value = false // 无论成功失败，都结束加载状态
}
</script>

<template>
  <div>
    <!-- 显示类别名称和ID -->
    <h3 @click="activeAddItemDialogF" style="cursor: pointer; color: #1890ff">
      {{ props.category.name }}
      <span style="font-size: 12px; color: #666">(ID: {{ props.category.id }})</span>
    </h3>

    <div v-if="isLoading">正在加载指标项...</div>

    <div v-else-if="loadError" style="color: #ff4d4f">
      加载失败: {{ loadError.message || '未知错误' }}
    </div>

    <div v-else-if="getTopItems().length === 0" style="color: #909399; margin: 20px 0">
      📌 该类别下暂无顶级指标项
      <br />
      - 检查数据库中是否存在 major_category_id = {{ props.category.id }} 的item
      <br />
      - 检查item的parent_id是否为NULL/0/空字符串
    </div>

    <div v-else style="margin-left: 20px; padding-left: 15px">
      <ItemNode v-for="item of getTopItems()" :item="item" :key="item.id" />
    </div>
  </div>
</template>

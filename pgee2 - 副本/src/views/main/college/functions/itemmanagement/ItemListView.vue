<script setup lang="ts">
import { CollegeService } from '@/services/CollegeService'
import type { MajorCategory } from '@/types'
import ItemNode from '@/views/main/college/functions/itemmanagement/ItemNode.vue'
import { defineAsyncComponent, getCurrentInstance, h, render } from 'vue'

const props = defineProps<{ category: MajorCategory }>()
const { data: itemsR, suspense } = CollegeService.listCategoryItemsService(props.category.id ?? '')
await suspense()
const instance = getCurrentInstance()
const getTopItems = () => (itemsR.value ?? []).filter(i => !i.parentId)

const activeAddItemDialogF = () => {
  const node = h(
    defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/ItemDialog.vue')
    ),
    { parentItem: {}, category: props.category }
  )
  node.appContext = instance!.appContext

  render(node, document.body)
}
</script>
<template>
  <div>
    <h3 @click="activeAddItemDialogF" style="cursor: pointer">
      {{ props.category.name }}
    </h3>
    <ItemNode v-for="item of getTopItems()" :item="item" :key="item.id" />
  </div>
</template>

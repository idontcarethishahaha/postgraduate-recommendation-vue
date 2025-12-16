<script setup lang="ts">
import type { Item } from '@/types'
import { defineAsyncComponent, getCurrentInstance, h, render, toRef } from 'vue'

const props = defineProps<{ item: Item }>()
const childrenItemsR = toRef(() => props.item.items ?? [])
const instance = getCurrentInstance()

const activeAddItemDialogF = () => {
  const node = h(
    defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/ItemDialog.vue')
    ),
    { parentItem: props.item }
  )
  node.appContext = instance!.appContext
  render(node, document.body)
}
</script>
<template>
  <ul>
    <li>
      <el-text type="primary" size="large" @click="activeAddItemDialogF" style="cursor: pointer">
        {{ props.item.name }} - {{ props.item.maxPoints }}
      </el-text>

      <template v-if="childrenItemsR.length > 0">
        <ItemNode v-for="ch of childrenItemsR" :key="ch.id" :item="ch" />
      </template>
    </li>
  </ul>
</template>
<style scoped>
ul {
  padding-left: 20px;
}
</style>

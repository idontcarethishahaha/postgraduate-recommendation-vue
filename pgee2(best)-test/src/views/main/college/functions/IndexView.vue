<script setup lang="ts">
import FunctionTag from '@/views/main/components/FunctionTag.vue'
import { defineAsyncComponent, type Component } from 'vue'

const components: { name: string; component: Component }[] = [
  {
    name: '类别专业',
    component: defineAsyncComponent(() => import('./CategoryManagementView.vue'))
  },
  {
    name: '项管理',
    component: defineAsyncComponent(
      () => import('@/views/main/college/functions/itemmanagement/IndexView.vue')
    )
  },
  {
    name: '用户管理',
    component: defineAsyncComponent(
      () => import('@/views/main/college/functions/UserManagementView.vue')
    )
  },
  {
    name: '重置密码',
    component: defineAsyncComponent(
      () => import('@/views/main/college/functions/ResetPasswordView.vue')
    )
  }
]

const componentsMap = new Map<string, Component>()
components.forEach(com => componentsMap.set(com.name, com.component))
</script>
<template>
  <FunctionTag :tagcoms="componentsMap" />
</template>

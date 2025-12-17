<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import HeaderView from './header/IndexView.vue'

const { suspense } = CommonService.getUserInfoService()
await suspense()
</script>

<template>
  <HeaderView />
  <!--根据路由加载对应角色的页面-->
  <RouterView />
  <!--在App.vue导入-->
</template>

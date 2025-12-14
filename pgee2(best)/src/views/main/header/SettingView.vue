<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import { Setting } from '@element-plus/icons-vue'
const { suspense, data: userInfoR } = CommonService.getUserInfoService()
await suspense()
</script>
<template>
  <el-button type="danger" :icon="Setting" @click="$router.push('/settings')" style="margin: 10px">
    {{ userInfoR?.name }}
  </el-button>
</template>

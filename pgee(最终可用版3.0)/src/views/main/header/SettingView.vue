<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import { Setting } from '@element-plus/icons-vue'
const { suspense, data: userInfoR } = CommonService.getUserInfoService()
await suspense()
</script>
<template>
  <p>↓点击此处按钮可修改密码</p>
  <el-button type="primary" :icon="Setting" @click="$router.push('/settings')" style="margin: 10px">
    你好！
    {{ userInfoR?.name }}
  </el-button>
</template>

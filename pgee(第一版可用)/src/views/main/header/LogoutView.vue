<script setup lang="ts">
import { CommonService } from '@/services/CommonService'
import { useQueryClient } from '@tanstack/vue-query'
const qc = useQueryClient()
const logoutF = () => {
  CommonService.clearLoginService()
  qc.clear()
}
</script>

<template>
  <el-button id="logout-btn" type="danger" size="default" @click="logoutF">退出</el-button>
</template>

<style scoped>
#logout-btn {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

#logout-btn:hover {
  background-color: #d03050;
}
</style>

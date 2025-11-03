<template>
  <suspense>
    <template #default>
      <router-view />
    </template>
    <template #fallback>
      <div class="loading-container">
        <el-loading-spinner size="60" />
        <p class="loading-text">加载中...</p>
      </div>
    </template>
  </suspense>
</template>

<script setup lang="ts">
import { ElLoadingSpinner } from 'element-plus'
import { Suspense } from 'vue'
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 20px;
  background-color: #fff;
}

.loading-text {
  font-size: 16px;
  color: #666;
}
</style>

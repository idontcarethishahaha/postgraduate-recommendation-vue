<script setup lang="ts">
import { CollegeService } from '@/services'
import { onMounted } from 'vue'

onMounted(() => {
  CollegeService.initCollegeManagement()
})
</script>

<template>
  <div class="admin-module">
    <div class="module-header">
      <h2>超级管理员中心</h2>
      <p>负责管理学院和学院管理员信息</p>
    </div>
    <div class="module-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.module-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}
.module-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>

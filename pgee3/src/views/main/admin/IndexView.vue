<script setup lang="ts">
import { CollegeService } from '@/services'

CollegeService.initCollegeManagement()
</script>

<template>
  <div class="admin-module">
    <div class="module-header">
      <h2>超级管理员中心</h2>
      <p>
        请点击上导航栏的“学院管理”进入学院管理界面,请勿直接点击“管理员管理”，需管理学院管理员请从学院管理页面的表格中的“管理员管理”进入具体学院的管理
      </p>
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

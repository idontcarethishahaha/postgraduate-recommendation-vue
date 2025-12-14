<script setup lang="ts">
//import { CollegeService } from '@/services'

//CollegeService.initCollegeManagement()
</script>

<template>
  <div class="admin-module">
    <div class="module-header">
      <!--公共头-->
      <h2>超级管理员中心</h2>
    </div>
    <div class="module-content">
      <router-view />

      <!--根据当前匹配的路由规则，动态渲染对应的子组件-->
      <!--当访问 /admin/colleges 时，<router-view /> 会渲染 CollegeManagementView 组件
          当访问 /admin/college-admins 时，会渲染 CollegeAdminsView 组件-->
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

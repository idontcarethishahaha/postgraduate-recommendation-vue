<script setup lang="ts"></script>

<template>
  <div>
    <div class="module-header">
      <!--公共头-->
      <h2>{{}}管理员中心</h2>
      <p>hello</p>
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

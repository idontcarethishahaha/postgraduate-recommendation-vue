<script setup lang="ts">
import HeaderView from './header/IndexView.vue'
</script>

<template>
  <div class="app-container">
    <!--公共头部-->
    <HeaderView />
    <!--子页面容器,根据路由加载对应角色的页面-->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
}
</style>

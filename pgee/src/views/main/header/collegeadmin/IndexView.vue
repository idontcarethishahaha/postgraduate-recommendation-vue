<script setup lang="ts">
//import { useRoute } from 'vue-router'

//const route = useRoute()
</script>
<!--
<template>

  <div class="collegeadmin-nav">
    <button
      class="nav-item"
      :class="{ active: route.path.includes('/collegeadmin/major-categories') }"
      @click="$router.push('/admin/major-categories')">
      学院类别管理
    </button>
  </div>
</template>
-->

<style scoped>
.collegeadmin-nav {
  display: flex;
  gap: 10px;
}
.nav-item {
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
}
.nav-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}
.nav-item:hover:not(.active) {
  background-color: #f5f5f5;
}
</style>

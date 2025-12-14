<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <suspense>
    <template #default>
      <RouterView />
    </template>
  </suspense>
</template>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

html {
  scrollbar-gutter: stable;
}

#app {
  max-width: 1200px;
  background: rgb(254, 254, 254);
  min-height: 100vh;
  border-radius: 4px;
  margin: 0 auto;
  padding: 15px;
}

.my-row {
  margin: 5px 5px 10px 5px;
  background-color: white;
  border-radius: 5px;
  padding: 25px 10px 10px 10px;
}

.el-col {
  margin-bottom: 10px;
}
.my-col {
  margin-bottom: 10px;
}

.el-icon.my-action-icon {
  font-size: 18px;
  cursor: pointer;
  vertical-align: middle;
  margin-right: 8px;
}
</style>

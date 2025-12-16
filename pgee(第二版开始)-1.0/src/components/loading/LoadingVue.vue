<script setup lang="ts">
import loadingImage from '@/assets/loading.gif'
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  /*当组件挂载到页面时，将body的overflow属性设为hidden，
  隐藏滚动条，防止遮罩层下方页面内容滚动*/
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  /*当组件从页面卸载时，清空body的overflow样式，允许页面重新滚动​​*/
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="loading-modal">
    <div class="loading-backdrop"></div>
    <div class="loading-content">
      <img :src="loadingImage" alt="loading" class="loading-image" />
      <p class="loading-text">全力加载中...</p>
    </div>
  </div>
</template>

<style scoped>
.loading-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 192, 203, 0.3), rgba(173, 216, 230, 0.3));
}

.loading-content {
  position: relative;
  background-color: white;
  width: 280px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-image {
  height: 150px;
  display: block;
  margin: 0 auto 12px;
}

.loading-text {
  text-align: center;
  margin: 0;
}
</style>

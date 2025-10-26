<script setup lang="ts">
import { CommonService } from '@/services'
import { ADMIN, COLLEGE_ADMIN, COUNSELOR, STUDENT } from '@/services/Const'
import { useUserStore } from '@/stores/UserStore'
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

// 获取当前用户角色和信息
const role = CommonService.getRole()
const userS = useUserStore().userS
const router = useRouter()

// 动态加载角色对应的导航组件
const RoleNavComponent =
  role === ADMIN
    ? defineAsyncComponent(() => import('@/views/main/header/admin/IndexView.vue'))
    : role === COLLEGE_ADMIN
      ? defineAsyncComponent(() => import('@/views/main/header/collegeadmin/IndexView.vue'))
      : role === COUNSELOR
        ? defineAsyncComponent(() => import('@/views/main/header/counselor/IndexView.vue'))
        : role === STUDENT
          ? defineAsyncComponent(() => import('@/views/main/header/student/IndexView.vue'))
          : null

// 退出登录
const handleLogout = () => {
  if (confirm('确定退出登录吗？')) {
    sessionStorage.clear()
    router.push('/login')
  }
}
</script>

<template>
  <div class="header">
    <!-- 系统标题 -->
    <div class="logo">推免管理系统</div>

    <!-- 角色专属导航（动态加载） -->
    <div class="role-nav">
      <component :is="RoleNavComponent" v-if="RoleNavComponent" />
    </div>

    <!-- 用户信息和操作 -->
    <div class="user-ops">
      <span class="username">{{ userS?.name || '未登录' }}</span>
      <button class="setting-btn" @click="$router.push('/settings')">设置</button>
      <button class="logout-btn" @click="handleLogout">退出</button>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.logo {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}
.role-nav {
  flex: 1;
  margin: 0 20px;
}
.user-ops {
  display: flex;
  align-items: center;
  gap: 15px;
}
.setting-btn,
.logout-btn {
  padding: 5px 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}
.logout-btn {
  color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>

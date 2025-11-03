<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">研究生推荐系统</h2>
      <el-form :model="form" label-width="80px" class="login-form">
        <el-form-item label="账号">
          <el-input
            v-model="form.account"
            placeholder="请输入账号"
            clearable
            @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            clearable
            @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
            登录
          </el-button>
          <el-button type="text" class="register-btn" @click="goToRegister">注册账号</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserService } from '@/services'
import type { LoginRequest } from '@/types'
import { createMessageDialog } from '@/utils/message'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const form = ref<LoginRequest>({
  account: '',
  password: ''
})

// 组件内表单验证（原在 UserService 中，移到组件内）
const validateLoginForm = (): boolean => {
  if (!form.value.account?.trim()) {
    createMessageDialog('请输入账号')
    return false
  }
  if (!form.value.password?.trim()) {
    createMessageDialog('请输入密码')
    return false
  }
  return true
}

// 登录处理：移除 try/catch（依赖全局异常处理）
const handleLogin = async () => {
  if (!validateLoginForm()) return

  loading.value = true
  // 直接调用 Service，异常由 axios 拦截器+全局 errorHandler 处理
  await UserService.login(form.value)
  loading.value = false
  router.push('/main')
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 400px;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
}

.register-btn {
  display: block;
  margin: 10px auto 0;
}
</style>

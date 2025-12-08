<template>
  <div class="login-page">
    <div class="login-header">
      <h1>推免系统</h1>
      <p>欢迎登录，请填写您的账号信息</p>
    </div>

    <el-form @submit.prevent="handleLogin" :model="form" label-width="80px" class="login-form">
      <el-form-item label="账号" prop="account" required>
        <el-input
          v-model="form.account"
          type="text"
          placeholder="请输入账号"
          ref="accountInput"
          clearable />
      </el-form-item>

      <el-form-item label="密码" prop="password" required>
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          @keypress.enter="handleLogin"
          show-password />
      </el-form-item>

      <el-form-item class="login-btn-group">
        <el-button type="primary" native-type="submit" :loading="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="register-link">
      <el-button type="text" @click="$router.push('/register')">学生注册</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { UserService } from '@/services'
import type { LoginRequest } from '@/types'
import { ref } from 'vue'
// 导入Element Plus组件
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'

const loading = ref(false)
const accountInput = ref<HTMLInputElement>()

const form = ref<LoginRequest>({
  account: '',
  password: ''
})

const handleLogin = async () => {
  const validation = UserService.validateLoginForm(form.value)
  if (!validation.isValid) {
    createMessageDialog(validation.message)
    return
  }

  loading.value = true

  await UserService.loginService(form.value)

  loading.value = false
}

accountInput.value?.focus()
if (UserService.isLoggedIn()) {
  const role = UserService.getRole()
  console.log('用户已登录，角色:', role)
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #1890ff;
  margin-bottom: 10px;
  font-size: 24px;
}

.login-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-btn-group {
  margin-top: 10px;
}

.login-btn {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}
</style>

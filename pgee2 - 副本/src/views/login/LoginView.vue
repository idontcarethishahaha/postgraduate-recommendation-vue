<script lang="ts" setup>
import { CommonService } from '@/services/CommonService'
import type { User } from '@/types'
import { Lock, SwitchButton, User as UserIco } from '@element-plus/icons-vue'
import { ref } from 'vue'

const user = ref<User>({})

const loginF = async () => {
  const account = user.value.account
  const password = user.value.password
  await CommonService.loginService({
    account: account,
    password: password
  })
  user.value.account = ''
  user.value.password = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-header">
      <h1>推免系统</h1>
      <p>欢迎登录，请填写您的账号信息</p>
      <p>示例: 账号admin 密码admin</p>
    </div>

    <el-form @keyup.enter="loginF" class="login-form">
      <el-form-item>
        <el-input
          size="large"
          v-model="user.account"
          placeholder="账号"
          :prefix-icon="UserIco"
          clearable />
      </el-form-item>

      <el-form-item>
        <el-input
          type="password"
          size="large"
          v-model="user.password"
          placeholder="密码"
          :prefix-icon="Lock"
          show-password />
      </el-form-item>

      <el-form-item class="login-btn-group">
        <el-button
          type="primary"
          @click="loginF"
          :disabled="!user.account || !user.password"
          class="login-btn">
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </el-form-item>
    </el-form>

    <div class="register-link">
      <el-button type="text" @click="$router.push('/register')">学生注册</el-button>
    </div>
  </div>
</template>

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

:deep(.el-form-item) {
  margin-bottom: 15px;
}
</style>

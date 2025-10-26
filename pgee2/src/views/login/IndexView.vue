<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { UserService } from '@/services'
import type { LoginRequest } from '@/types'
import { ref } from 'vue'

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

<template>
  <div>
    <div>
      <h1>推免系统</h1>
      <p>欢迎登录，请填写您的账号信息</p>
    </div>

    <form @submit.prevent="handleLogin">
      <div>
        <label for="account">账号</label>
        <input
          v-model="form.account"
          type="text"
          id="account"
          placeholder="请输入账号"
          required
          ref="accountInput" />
      </div>

      <div>
        <label for="password">密码</label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          placeholder="请输入密码"
          required
          @keypress.enter="handleLogin" />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>

    <div>
      <router-link to="/register">学生注册</router-link>
    </div>
  </div>
</template>

<style scoped></style>

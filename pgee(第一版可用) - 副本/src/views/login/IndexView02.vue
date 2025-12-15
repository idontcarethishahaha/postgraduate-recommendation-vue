<script lang="ts" setup>
import LoginView from '@/views/login/LoginView.vue'
import { ref } from 'vue'

const activeName = ref('Login')
</script>

<template>
  <el-row>
    <el-col :span="18" :offset="3" style="margin-top: 15px">
      <el-card class="box-card">
        <el-tabs v-model="activeName" class="demo-tabs">
          <el-tab-pane label="登录" name="Login">
            <LoginView />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </el-col>
  </el-row>
</template>

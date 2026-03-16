<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import { ref } from 'vue'

const accountR = ref('')

const submitF = async () => {
  if (!accountR.value || accountR.value.length == 0) {
    throw '请输入账号'
  }
  await CollegeService.updatePasswordService(accountR.value)
  createElNotificationSuccess('重置成功')
  accountR.value = ''
}
</script>
<template>
  <el-row class="my-row">
    <el-col>
      <el-form label-width="80px" style="width: 400px">
        <el-form-item>
          <p class="info">重置后密码默认与账号一致</p>
          <el-input v-model="accountR" placeholder="请输入需要重置密码的账号" size="large" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitF" :disabled="!accountR">重置密码</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style scoped>
.info {
  color: #769ff1;
  font-size: 15px;
  margin-bottom: 10px;
}
</style>

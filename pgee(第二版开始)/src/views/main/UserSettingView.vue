<script lang="ts" setup>
import { createElNotificationSuccess } from '@/components/message'
import { CommonService } from '@/services/CommonService'
import { Lock } from '@element-plus/icons-vue'
import { ref } from 'vue'

const showPasswordR = ref(false)
const pwdM = ref({ p1: '', p2: '' })

const resetPwd = async () => {
  if (!pwdM.value.p1 || !(pwdM.value.p1 == pwdM.value.p2)) {
    throw '2次输入密码不同,请重新输入'
  }
  await CommonService.updatePasswordService(pwdM.value.p1)
  createElNotificationSuccess('密码更改成功')
  pwdM.value.p2 = pwdM.value.p1 = ''

  showPasswordR.value = false
}
</script>
<template>
  <el-row class="my-row">
    <el-col :span="8">
      <p style="margin-bottom: 8px">修改密码</p>
      <el-input
        type="password"
        v-model="pwdM.p1"
        placeholder="请输入修改后密码"
        :prefix-icon="Lock"
        style="margin-bottom: 10px" />
      <el-input
        type="password"
        v-model="pwdM.p2"
        placeholder="请再次确认密码"
        :prefix-icon="Lock" />
    </el-col>
    <el-col>
      <el-button
        @click="resetPwd"
        :disabled="!pwdM.p2 || !pwdM.p1"
        style="
          background-color: #1890ff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        "
        :style="!pwdM.p2 || !pwdM.p1 ? { backgroundColor: '#a0cfff', cursor: 'not-allowed' } : {}">
        提交修改
      </el-button>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-button:hover:not(:disabled) {
  background-color: #40a9ff !important;
}
</style>

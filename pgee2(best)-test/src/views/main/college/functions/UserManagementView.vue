<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { RegisterUserDTO } from '@/types'
import { computed, ref, shallowRef } from 'vue'

// 添加辅导员
const { data: result, suspense } = CollegeService.listCounselorsService()
await suspense()
const categoriesR = shallowRef((result.value ?? []).map(res => res.category))

const userR = ref<RegisterUserDTO>({})
const catidsR = ref<string[]>([])

const { mutateAsync } = CollegeService.addAdminService()

const submitF = async () => {
  userR.value.majorCategoryIds = catidsR.value
  await mutateAsync(userR.value)
  createElNotificationSuccess('辅导员添加成功')
  userR.value = {}
  catidsR.value = []
}

const submitC = computed(() => {
  return userR.value.name && userR.value.account && catidsR.value?.length > 0
})
</script>

<template>
  <el-row class="my-row">
    <el-col>
      <el-form label-width="80px" style="width: 400px">
        <el-form-item>
          <p class="info">再此添加辅导员(默认密码为工号)</p>
          <p v-for="catUser of result" :key="catUser.category?.id">
            {{ catUser.category?.name }}:
            <span v-for="user of catUser.users" :key="user.id">{{ user.name }};</span>
          </p>
        </el-form-item>
        <el-form-item>
          <el-input v-model="userR.name" placeholder="*姓名" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="userR.account" placeholder="*工号" size="large" />
        </el-form-item>
        <el-form-item>
          <el-checkbox-group v-model="catidsR">
            <el-checkbox
              v-for="cat in categoriesR"
              :key="cat?.id"
              :label="cat?.name"
              size="large"
              :value="cat?.id"
              border />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="submitF"
            :disabled="!submitC"
            style="padding: 8px 16px; border-radius: 4px">
            添加辅导员
          </el-button>
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

:deep(.el-button) {
  color: #ffffff !important;
  border-color: #1890ff !important;
  background-color: #1890ff !important;
  border: none;
}

:deep(.el-button:disabled) {
  background-color: #a0cfff !important;
  border-color: #a0cfff !important;
  color: #ffffff !important;
  cursor: not-allowed;
}

:deep(.el-button:not(:disabled):hover) {
  background-color: #40a9ff !important;
  border-color: #40a9ff !important;
  color: #ffffff !important;
}
</style>

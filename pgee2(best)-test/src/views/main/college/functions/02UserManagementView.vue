<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CollegeService } from '@/services/CollegeService'
import type { MajorCategory, RegisterUserDTO } from '@/types'
import { computed, ref, shallowRef } from 'vue'

// 添加辅导员
const { data: result, suspense } = CollegeService.listCounselorsService()
await suspense()

// 过滤掉 undefined 的类别
const categoriesR = shallowRef(
  (result.value ?? [])
    .map(res => res.majorCategory)
    .filter((cat): cat is MajorCategory => Boolean(cat?.id && cat?.name))
)

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
  return userR.value.name?.trim() && userR.value.account?.trim() && catidsR.value?.length > 0
})
</script>

<template>
  <el-row class="my-row">
    <el-col>
      <el-form label-width="80px" style="width: 400px">
        <el-form-item>
          <p class="info">在此添加辅导员(默认密码为工号)</p>
          <p v-for="catUser of result" :key="catUser.majorCategory?.id">
            {{ catUser.majorCategory?.name }}:
            <span v-for="user of catUser.users" :key="user.id">{{ user.name }};</span>
          </p>
        </el-form-item>
        <el-form-item>
          <el-input v-model="userR.name" placeholder="*姓名" size="large" clearable />
        </el-form-item>
        <el-form-item>
          <el-input v-model="userR.account" placeholder="*工号" size="large" clearable />
        </el-form-item>
        <el-form-item>
          <el-checkbox-group v-model="catidsR">
            <!-- 关键修改：使用 :label 显示文本，:value 指定值 -->
            <el-checkbox
              v-for="cat in categoriesR"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
              size="large"
              border />
          </el-checkbox-group>
          <!-- 添加调试信息 -->
          <p v-if="catidsR.length > 0" style="color: #666; font-size: 12px; margin-top: 8px">
            已选择: {{ catidsR.join(', ') }}
          </p>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="submitF"
            :disabled="!submitC"
            type="primary"
            style="padding: 8px 16px; border-radius: 4px">
            添加辅导员
          </el-button>
          <!-- 添加调试信息 -->
          <p style="color: #999; font-size: 12px; margin-top: 8px">
            按钮{{ submitC ? '可用' : '禁用' }} - 姓名: {{ userR.name ? '已填写' : '未填写' }},
            工号: {{ userR.account ? '已填写' : '未填写' }}, 类别: {{ catidsR.length }}个
          </p>
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

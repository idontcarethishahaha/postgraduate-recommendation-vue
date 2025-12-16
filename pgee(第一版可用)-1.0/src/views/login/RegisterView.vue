<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CommonService } from '@/services/CommonService'
import type { Major, User } from '@/types'
import { computed, ref } from 'vue'

const { data: collegesR } = CommonService.listCollegesService()

const collegeIdR = ref('')
const majorR = ref<Major>()
const majorsR = ref<Major[]>([])
const userR = ref<User>({ account: '', tel: '', name: '' })

const selectCollegeF = (cid: string) => {
  const r = collegesR.value!.find(d => d.college.id === cid)
  console.log('学院对应的专业数据：', r?.majors)
  majorsR.value = r?.majors ?? []
}

const submitC = computed(
  () =>
    majorR.value?.majorCategoryId &&
    majorR.value &&
    userR.value.account &&
    userR.value.name &&
    userR.value.tel &&
    userR.value.account.length === 10 &&
    userR.value.tel.length === 11
)

const submitF = async () => {
  const account = userR.value.account
  const tel = userR.value.tel
  userR.value.collegeId = collegeIdR.value
  userR.value.majorId = majorR.value?.id
  userR.value.majorCategoryId = majorR.value?.majorCategoryId || ''

  if (account?.length !== 10 || isNaN(parseInt(account))) {
    throw '学号应为数字，或位数错误'
  }
  if (tel?.length !== 11 || isNaN(parseInt(tel))) {
    throw '手机号错误'
  }
  if (!userR.value.collegeId || !userR.value.majorCategoryId) {
    throw '专业错误'
  }

  await CommonService.registerService(userR.value)
  createElNotificationSuccess('注册成功')
  CommonService.loginService({ account: userR.value.account, password: userR.value.account })
}
</script>

<template>
  <div class="register-page">
    <p class="title">学生注册</p>
    <el-row justify="center">
      <el-col :span="16" style="margin-top: 15px">
        <el-form class="register-form">
          <el-form-item>
            <el-select
              @change="selectCollegeF"
              value-key="id"
              v-model="collegeIdR"
              placeholder="学院"
              size="large"
              style="width: 200px; margin-right: 10px">
              <el-option
                v-for="(depart, index) of collegesR"
                :key="index"
                :label="depart.college.name"
                :value="depart.college.id" />
            </el-select>
            <el-select
              placeholder="专业"
              value-key="id"
              v-model="majorR"
              size="large"
              v-if="collegeIdR"
              style="width: 200px">
              <el-option
                v-for="(major, index) of majorsR"
                :key="index"
                :label="major.name"
                :value="major" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-input v-model="userR.name" placeholder="*姓名" size="large" />
          </el-form-item>

          <el-form-item>
            <el-input v-model="userR.account" placeholder="*学号" size="large" />
          </el-form-item>

          <el-form-item>
            <el-input v-model="userR.tel" placeholder="*手机号" size="large" />
          </el-form-item>

          <!-- 按钮组：修复标签嵌套，优化文字显示 -->
          <el-form-item class="btn-group">
            <el-button
              type="primary"
              @click="submitF"
              :disabled="!submitC"
              size="large"
              style="width: 180px; margin-right: 10px">
              注册
            </el-button>
            <el-button
              type="primary"
              plain
              @click="$router.push('/login')"
              size="large"
              style="width: 180px">
              有帐号了,马上登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.register-page {
  padding: 20px;
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #40a9ff;
  margin-top: 0;
}

.register-form {
  width: 500px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.btn-group {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 10px;
}

:deep(.el-button--primary) {
  background-color: #1890ff;
  border-color: #1890ff;
}
:deep(.el-button--primary:hover) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}
:deep(.el-button--primary.is-plain) {
  color: #1890ff;
  border-color: #1890ff;
  background: #f5faff;
}
:deep(.el-button--primary.is-plain:hover) {
  color: #fff;
  background-color: #40a9ff;
  border-color: #40a9ff;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  padding: 8px 15px;
}
:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>

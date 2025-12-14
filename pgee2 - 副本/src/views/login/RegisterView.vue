<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CommonService } from '@/services/CommonService'
import type { Major, User } from '@/types'
import { User as UserICO } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

const { data: collegesR } = CommonService.listCollegesService()

const collegeIdR = ref('')
const majorR = ref<Major>()
const majorsR = ref<Major[]>([])
const userR = ref<User>({ account: '', tel: '', name: '' })

const selectCollegeF = (cid: string) => {
  const r = collegesR.value!.find(d => d.college.id === cid)
  majorsR.value = r?.majors ?? []
}

const submitC = computed(
  () =>
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
  userR.value.catId = majorR.value?.catId

  if (account?.length !== 10 || isNaN(parseInt(account))) {
    throw '学号应为数字，或位数错误'
  }
  if (tel?.length !== 11 || isNaN(parseInt(tel))) {
    throw '手机号错误'
  }
  if (!userR.value.collegeId || !userR.value.catId) {
    throw '专业错误'
  }

  await CommonService.registerService(userR.value)
  createElNotificationSuccess('注册成功')
  CommonService.loginService({ account: userR.value.account, password: userR.value.account })
}
</script>
<template>
  <el-row>
    <el-col :span="16" style="margin-top: 15px">
      <el-form style="width: 500px">
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

        <el-form-item>
          <el-button type="primary" @click="submitF" :disabled="!submitC">
            <el-icon><UserICO /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

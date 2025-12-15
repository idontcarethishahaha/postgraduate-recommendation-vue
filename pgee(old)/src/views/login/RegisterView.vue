<template>
  <div class="register-page">
    <div class="register-header">
      <h1>学生注册</h1>
    </div>

    <el-alert v-if="errorMessage" :message="errorMessage" type="error" closable class="alert-box" />
    <el-alert
      v-if="successMessage"
      :message="successMessage"
      type="success"
      closable
      class="alert-box" />

    <el-form
      @submit.prevent="handleRegister"
      :model="form"
      label-width="80px"
      class="register-form">
      <el-form-item label="学号:" prop="account" required>
        <el-input v-model="form.account" type="text" placeholder="请输入学号" clearable />
      </el-form-item>

      <el-form-item label="姓名:" prop="name" required>
        <el-input v-model="form.name" type="text" placeholder="请输入姓名" clearable />
      </el-form-item>

      <el-form-item label="电话:" prop="tel" required>
        <el-input v-model="form.tel" type="tel" placeholder="请输入电话" clearable />
      </el-form-item>

      <el-form-item label="学院:" prop="collegeId" required>
        <el-select v-model="selectedCollegeId" placeholder="请选择学院" clearable>
          <el-option
            v-for="college of colleges"
            :key="college.id"
            :label="college.name"
            :value="college.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="专业:" prop="majorId" required>
        <el-select
          v-model="selectedMajorId"
          :placeholder="
            !selectedCollegeId
              ? '请先选择学院'
              : majors.length === 0
                ? '该学院暂无专业'
                : '请选择专业'
          "
          :disabled="!selectedCollegeId || majors.length === 0"
          clearable>
          <el-option
            v-for="major of majors"
            :key="major.id"
            :label="major.name"
            :value="major.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="密码:" prop="password" required>
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>

      <el-form-item class="register-btn-group">
        <el-button type="primary" native-type="submit" :loading="loading" class="register-btn">
          {{ loading ? '注册中...' : '注册' }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="login-link">
      <el-button type="text" @click="$router.push('/login')">已有账号？立即登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { StudentService } from '@/services'
import type { College, Major, RegisterRequest } from '@/types'
import { ElAlert, ElButton, ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const colleges = ref<College[]>([])
const majors = ref<Major[]>([])
const selectedCollegeId = ref<string | ''>('')
const selectedMajorId = ref<string | ''>('')

const form = reactive<RegisterRequest>({
  account: '',
  name: '',
  tel: '',
  password: '',
  collegeId: '',
  majorId: ''
})

watch(selectedCollegeId, async newCollegeId => {
  if (newCollegeId) {
    form.collegeId = newCollegeId
    await loadMajors(newCollegeId)
  } else {
    form.collegeId = ''
    selectedMajorId.value = ''
    majors.value = []
  }
})

watch(selectedMajorId, newMajorId => {
  form.majorId = newMajorId || ''
})

// 加载学院列表
const loadColleges = async () => {
  colleges.value = await StudentService.getColleges()
}

// 加载专业列表
const loadMajors = async (collegeId: string) => {
  majors.value = await StudentService.getMajorsByCollege(collegeId)
  selectedMajorId.value = ''
}

const handleRegister = async () => {
  const validation = StudentService.validateRegisterForm(form)
  if (!validation.isValid) {
    createMessageDialog(validation.message)
    loading.value = false
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  await StudentService.register({
    name: form.name.trim(),
    account: form.account.trim(),
    tel: form.tel.trim(),
    password: form.password,
    collegeId: form.collegeId,
    majorId: form.majorId
  })
    .then(() => {
      successMessage.value = '注册成功!进入登录页面...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    })
    .finally(() => {
      loading.value = false
    })
}
loadColleges().then(() => {
  console.log('学院数据加载完成')
})
</script>

<style scoped>
.register-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #1890ff;
  margin-bottom: 10px;
  font-size: 24px;
}

.alert-box {
  margin-bottom: 20px;
}

.register-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-btn-group {
  margin-top: 10px;
}

.register-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}
</style>

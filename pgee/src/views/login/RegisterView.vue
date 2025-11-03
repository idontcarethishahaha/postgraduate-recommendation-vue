<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { StudentService } from '@/services'
import type { College, Major, RegisterRequest } from '@/types'
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

<template>
  <div>
    <div>
      <h1>学生注册</h1>
    </div>

    <div v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage">
      {{ successMessage }}
    </div>

    <form @submit.prevent="handleRegister">
      <div>
        <label for="account">学号:</label>
        <input v-model="form.account" type="text" id="account" placeholder="请输入学号" required />
      </div>

      <div>
        <label for="name">姓名:</label>
        <input v-model="form.name" type="text" id="name" placeholder="请输入姓名" required />
      </div>

      <div>
        <label for="tel">电话:</label>
        <input v-model="form.tel" type="tel" id="tel" placeholder="请输入电话" required />
      </div>

      <div>
        <label for="collegeSelect">学院:</label>
        <select v-model="selectedCollegeId" id="collegeSelect" required>
          <option value="">请选择学院</option>
          <option v-for="college of colleges" :key="college.id" :value="college.id">
            {{ college.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="majorSelect">专业:</label>
        <select
          v-model="selectedMajorId"
          id="majorSelect"
          required
          :disabled="!selectedCollegeId || majors.length === 0">
          <option value="">
            {{
              !selectedCollegeId
                ? '请先选择学院'
                : majors.length === 0
                  ? '该学院暂无专业'
                  : '请选择专业'
            }}
          </option>
          <option v-for="major of majors" :key="major.id" :value="major.id">
            {{ major.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="password">密码:</label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          placeholder="请输入密码"
          required />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>

    <div>
      <router-link to="/login">已有账号？立即登录</router-link>
    </div>
  </div>
</template>

<style scoped></style>

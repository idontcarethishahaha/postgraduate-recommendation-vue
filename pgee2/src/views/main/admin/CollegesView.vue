<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { CollegeService } from '@/services'
import { formatDate } from '@/services/FormatUtils'
import { useCollegeStore } from '@/stores/CollegeStore'
import type { College } from '@/types'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const collegeStore = useCollegeStore()

const showModal = ref(false)
const isEditing = ref(false)
const collegeForm = ref({ id: '', name: '' })
const colleges = collegeStore.collegesS

//添加学院
const showAddCollegeModal = () => {
  collegeForm.value = { id: '', name: '' }
  isEditing.value = false
  showModal.value = true
}

// 编辑学院
const editCollege = (college: College) => {
  collegeForm.value = { ...college }
  isEditing.value = true
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 保存学院
const saveCollege = async () => {
  const validation = CollegeService.validateCollegeForm(collegeForm.value)
  if (!validation.isValid) {
    createMessageDialog(validation.message)
    return
  }

  if (isEditing.value) {
    await CollegeService.updateCollege(collegeForm.value.id, {
      name: collegeForm.value.name.trim()
    })
  } else {
    await CollegeService.addCollege({
      name: collegeForm.value.name.trim()
    })
  }
  closeModal()
}

// 删除学院
const removeCollege = (college: College) => {
  CollegeService.deleteCollege(college)
}

// 跳转到管理员管理页面,RESTful路径参数拼接
const manageAdmins = (college: College) => {
  const encodedName = encodeURIComponent(college.name)
  router.push(`/admin/college-admins/${college.id}/${encodedName}`)
}

CollegeService.initCollegeManagement()
</script>

<template>
  <div class="college-page">
    <div class="toolbar">
      <button @click="showAddCollegeModal" class="add-btn">添加学院</button>
    </div>

    <div class="college-list">
      <table class="college-table">
        <thead>
          <tr>
            <th>学院名称</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="college of colleges" :key="college.id">
            <td>{{ college.name }}</td>
            <td>{{ formatDate(college.createTime) }}</td>
            <td>{{ formatDate(college.updateTime) }}</td>
            <td class="actions">
              <button @click="editCollege(college)" class="edit-btn">编辑</button>
              <button @click="manageAdmins(college)" class="manage-btn">管理管理员</button>
              <button @click="removeCollege(college)" class="delete-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑学院' : '添加学院' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <input
            v-model="collegeForm.name"
            type="text"
            placeholder="请输入学院名称"
            class="form-input" />
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">取消</button>
          <button @click="saveCollege" class="save-btn">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 1rem;
}
.add-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.college-table {
  width: 100%;
  border-collapse: collapse;
}
.college-table th,
.college-table td {
  padding: 0.8rem;
  border: 1px solid #e8e8e8;
  text-align: left;
}
.actions button {
  margin-right: 0.5rem;
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.edit-btn {
  background: #faad14;
  color: white;
}
.manage-btn {
  background: #52c41a;
  color: white;
}
.delete-btn {
  background: #ff4d4f;
  color: white;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 400px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.form-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e8e8e8;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
}
.save-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

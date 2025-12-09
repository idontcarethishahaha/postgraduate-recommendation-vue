<template>
  <div class="college-page">
    <div class="toolbar">
      <el-button type="primary" @click="showAddCollegeModal" class="add-btn">添加学院</el-button>
    </div>

    <div class="college-list">
      <el-table
        :data="colleges"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }">
        <el-table-column label="学院名称" prop="name" />
        <el-table-column label="创建时间" prop="createTime">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime">
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button type="warning" text @click="editCollege(scope.row)" class="edit-btn">
              编辑
            </el-button>
            <el-button type="success" text @click="manageAdmins(scope.row)" class="manage-btn">
              管理管理员
            </el-button>
            <el-button type="danger" text @click="removeCollege(scope.row)" class="delete-btn">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="showModal"
      :title="isEditing ? '编辑学院' : '添加学院'"
      width="400px"
      destroy-on-close>
      <el-form :model="collegeForm" label-width="0px" class="modal-form">
        <el-form-item>
          <el-input
            v-model="collegeForm.name"
            type="text"
            placeholder="请输入学院名称"
            class="form-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModal" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="saveCollege" class="save-btn">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { createMessageDialog } from '@/components/message'
import { CollegeService } from '@/services'
import { formatDate } from '@/services/FormatUtils'
import { useCollegeStore } from '@/stores/CollegeStore'
import type { College } from '@/types'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn
} from 'element-plus'
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

.actions button {
  margin-right: 0.5rem;
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.edit-btn {
  color: #faad14;
}
.manage-btn {
  color: #52c41a;
}
.delete-btn {
  color: #ff4d4f;
}
.modal-form {
  width: 100%;
}
.form-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
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

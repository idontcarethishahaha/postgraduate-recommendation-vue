<template>
  <div class="major-categories-page">
    <el-breadcrumb class="breadcrumb" separator=">">
      <el-breadcrumb-item style="cursor: pointer; color: #1890ff">
        {{ college.name || '未知学院' }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>专业类别管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="page-header">
      <h2 class="page-title">专业类别管理</h2>
      <el-button type="primary" class="add-btn" @click="openAddModal">添加专业类别</el-button>
    </div>

    <el-card class="stats" shadow="hover">
      专业类别总数：
      <strong>{{ categories.length }}</strong>
    </el-card>

    <el-table
      v-if="categories.length > 0"
      :data="categories"
      border
      stripe
      style="width: 100%; margin: 1rem 0"
      :header-cell-style="{ background: '#f5f7fa' }">
      <el-table-column label="类别名称" prop="name" />
      <el-table-column label="计算规则" prop="calculationRule">
        <template #default="scope">
          <div v-for="(weight, ruleName) in scope.row.calculationRule" :key="ruleName">
            {{ ruleName }}：{{ weight }}%
          </div>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <div class="action-buttons">
            <el-button type="primary" text class="action-btn" @click="manageMajors(scope.row)">
              管理专业
            </el-button>
            <el-button type="warning" text class="action-btn" @click="openEditModal(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" text class="action-btn" @click="removeCategory(scope.row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="empty-state">
      <h3>暂无专业类别</h3>
      <p>点击"添加专业类别"按钮来添加</p>
    </div>

    <el-dialog
      v-model="addModalVisible"
      title="添加专业类别"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" class="modal-form" ref="addFormRef">
        <el-form-item label="类别名称 *" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入专业类别名称" class="form-control" />
        </el-form-item>

        <el-form-item label="计算规则 *" prop="calculationRule">
          <div class="rule-container">
            <div class="rule-header">
              <div class="col-name">规则名称</div>
              <div class="col-weight">权重（%）</div>
              <div class="col-op">操作</div>
            </div>

            <div
              class="rule-row"
              v-for="(item, index) in addForm.ruleItems"
              :key="item.id"
              :class="{ 'confirmed-row': item.isConfirmed }">
              <el-input
                v-model="item.ruleName"
                placeholder="如：学业绩点、竞赛加分"
                class="form-control rule-input"
                :disabled="item.isConfirmed" />

              <el-input
                v-model.number="item.weight"
                type="number"
                min="0"
                max="100"
                placeholder="0-100整数"
                class="form-control rule-input weight-input"
                :disabled="item.isConfirmed"
                @input="handleAddWeightInput(item)"
                @blur="validateAddWeight(item)" />

              <div class="rule-op">
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  class="btn-delete"
                  @click="deleteAddRuleRow(index)"
                  :disabled="addForm.ruleItems.length === 1">
                  删除
                </el-button>
                <el-button
                  type="primary"
                  text
                  class="btn-confirm"
                  @click="toggleAddRuleConfirm(index)"
                  :class="{ 'btn-cancel': item.isConfirmed }">
                  {{ item.isConfirmed ? '取消' : '确定' }}
                </el-button>
              </div>
            </div>

            <el-button type="text" icon="el-icon-plus" class="btn-add-row" @click="addAddRuleRow">
              添加规则行
            </el-button>

            <div class="weight-summary">
              已确定行权重总和：
              <span :class="{ 'text-error': addTotalConfirmedWeight !== 100 }">
                {{ addTotalConfirmedWeight }}
              </span>
              <span v-if="addTotalConfirmedWeight !== 100" class="tip-text">
                （需等于100才能提交）
              </span>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeAddModal">取消</el-button>
        <el-button
          type="primary"
          @click="submitAddForm"
          :disabled="addTotalConfirmedWeight !== 100 || !addForm.name.trim()">
          提交
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editModalVisible"
      title="修改专业类别"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" class="modal-form" ref="editFormRef">
        <el-form-item label="类别名称 *" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入专业类别名称" class="form-control" />
        </el-form-item>

        <el-form-item label="计算规则 *" prop="calculationRule">
          <div class="rule-container">
            <div class="rule-header">
              <div class="col-name">规则名称</div>
              <div class="col-weight">权重（%）</div>
              <div class="col-op">操作</div>
            </div>

            <div
              class="rule-row"
              v-for="(item, index) in editForm.ruleItems"
              :key="item.id"
              :class="{ 'confirmed-row': item.isConfirmed }">
              <el-input
                v-model="item.ruleName"
                placeholder="如：学业绩点、竞赛加分"
                class="form-control rule-input"
                :disabled="item.isConfirmed" />

              <el-input
                v-model.number="item.weight"
                type="number"
                min="0"
                max="100"
                placeholder="0-100整数"
                class="form-control rule-input weight-input"
                :disabled="item.isConfirmed"
                @input="handleEditWeightInput(item)"
                @blur="validateEditWeight(item)" />

              <div class="rule-op">
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  class="btn-delete"
                  @click="deleteEditRuleRow(index)"
                  :disabled="editForm.ruleItems.length === 1">
                  删除
                </el-button>
                <el-button
                  type="primary"
                  text
                  class="btn-confirm"
                  @click="toggleEditRuleConfirm(index)"
                  :class="{ 'btn-cancel': item.isConfirmed }">
                  {{ item.isConfirmed ? '取消' : '确定' }}
                </el-button>
              </div>
            </div>

            <el-button type="text" icon="el-icon-plus" class="btn-add-row" @click="addEditRuleRow">
              添加规则行
            </el-button>

            <div class="weight-summary">
              已确定行权重总和：
              <span :class="{ 'text-error': editTotalConfirmedWeight !== 100 }">
                {{ editTotalConfirmedWeight }}
              </span>
              <span v-if="editTotalConfirmedWeight !== 100" class="tip-text">
                （需等于100才能提交）
              </span>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeEditModal">取消</el-button>
        <el-button
          type="primary"
          @click="submitEditForm"
          :disabled="editTotalConfirmedWeight !== 100 || !editForm.name.trim()">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { CollegeService, MajorCategoryService } from '@/services'
import type { MajorCategoryAddDTO, MajorCategoryUpdateDTO } from '@/services/MajorCategoryService'
import { useMajorCategoryStore } from '@/stores/MajorCategoryStore'
import type { CalculationRuleStorage, College, MajorCategory } from '@/types'
import { getCollegeIdStrFromToken } from '@/utils/token'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 规则行
interface RuleItem {
  id: string
  ruleName: string
  weight: number
  isConfirmed: boolean
}

// 表单
interface CategoryForm {
  id: string
  name: string
  ruleItems: RuleItem[]
}

const router = useRouter()
const route = useRoute()

// 学院信息和类别数据
const college = ref<College>({
  id: '',
  name: '未知学院',
  createTime: '',
  updateTime: ''
})
const categories = ref<MajorCategory[]>([])
const isInitialized = ref(false)

const { setMajorCategories, addMajorCategory, updateMajorCategory, removeMajorCategory } =
  useMajorCategoryStore()

// 添加弹窗状态
const addModalVisible = ref(false)
const addFormRef = ref<FormInstance>()

// 添加表单数据
const initAddForm = (): CategoryForm => ({
  id: '',
  name: '',
  ruleItems: [
    {
      id: uuidv4(),
      ruleName: '',
      weight: 0,
      isConfirmed: false
    }
  ]
})
const addForm = ref<CategoryForm>(initAddForm())

// 添加表单权重总和
const addTotalConfirmedWeight = computed(() => {
  return addForm.value.ruleItems
    .filter(item => item.isConfirmed)
    .reduce((sum, item) => {
      const validWeight = Number.isInteger(item.weight) ? item.weight : 0
      return sum + (validWeight < 0 || validWeight > 100 ? 0 : validWeight)
    }, 0)
})

// 添加表单规则行
const addAddRuleRow = (): void => {
  addForm.value.ruleItems.push({
    id: uuidv4(),
    ruleName: '',
    weight: 0,
    isConfirmed: false
  })
}
const deleteAddRuleRow = (index: number): void => {
  if (addForm.value.ruleItems.length <= 1) {
    ElMessage.warning('至少保留1条规则行')
    return
  }
  addForm.value.ruleItems.splice(index, 1)
}
const toggleAddRuleConfirm = (index: number): void => {
  const item = addForm.value.ruleItems[index]
  if (!item.isConfirmed) {
    if (!item.ruleName.trim()) {
      ElMessage.warning('请先填写规则名称')
      return
    }
    if (!Number.isInteger(item.weight) || item.weight < 0 || item.weight > 100) {
      ElMessage.warning('权重需为0-100的整数')
      return
    }
  }
  item.isConfirmed = !item.isConfirmed
}
const handleAddWeightInput = (item: RuleItem): void => {
  if (!Number.isInteger(item.weight)) {
    item.weight = Math.floor(item.weight) || 0
  }
  item.weight = Math.max(0, Math.min(100, item.weight))
}
const validateAddWeight = (item: RuleItem): void => {
  if (!Number.isInteger(item.weight) || item.weight < 0 || item.weight > 100) {
    ElMessage.warning('权重需为0-100的整数')
    item.weight = 0
  }
}

// 添加弹窗控制
const openAddModal = (): void => {
  addForm.value = initAddForm()
  addModalVisible.value = true
}
const closeAddModal = (): void => {
  addModalVisible.value = false
  addFormRef.value?.resetFields()
}

// 添加表单提交
const convertAddToStorageFormat = (): CalculationRuleStorage => {
  const storageObj: CalculationRuleStorage = {}
  addForm.value.ruleItems
    .filter(item => item.isConfirmed && item.ruleName.trim())
    .forEach(item => {
      storageObj[item.ruleName.trim()] = item.weight
    })
  return storageObj
}
const submitAddForm = async (): Promise<void> => {
  const confirmedItems = addForm.value.ruleItems.filter(item => item.isConfirmed)
  if (confirmedItems.length === 0) {
    ElMessage.error('请至少确定1条规则行')
    return
  }

  const requestData: MajorCategoryAddDTO = {
    name: addForm.value.name.trim(),
    calculationRule: convertAddToStorageFormat()
  }
  const newCategory = await MajorCategoryService.addCategory(requestData)
  addMajorCategory(newCategory)
  categories.value.push(newCategory)
  ElMessage.success('专业类别添加成功')
  closeAddModal()
}

// 编辑弹窗状态
const editModalVisible = ref(false)
const editFormRef = ref<FormInstance>()
const currentEditCategoryId = ref('') //记录当前编辑的类别ID

// 编辑表单数据
const initEditForm = (category: MajorCategory): CategoryForm => {
  const ruleItems = Object.entries(category.calculationRule).map(([ruleName, weight]) => ({
    id: uuidv4(),
    ruleName,
    weight: Number(weight),
    isConfirmed: true
  }))
  return {
    id: category.id,
    name: category.name,
    ruleItems:
      ruleItems.length > 0
        ? ruleItems
        : [{ id: uuidv4(), ruleName: '', weight: 0, isConfirmed: false }]
  }
}
const editForm = ref<CategoryForm>(
  initEditForm({
    id: '',
    name: '',
    calculationRule: {},
    createTime: '',
    updateTime: ''
  })
)

// 编辑表单权重总和
const editTotalConfirmedWeight = computed(() => {
  return editForm.value.ruleItems
    .filter(item => item.isConfirmed)
    .reduce((sum, item) => {
      const validWeight = Number.isInteger(item.weight) ? item.weight : 0
      return sum + (validWeight < 0 || validWeight > 100 ? 0 : validWeight)
    }, 0)
})

// 编辑表单规则行
const addEditRuleRow = (): void => {
  editForm.value.ruleItems.push({
    id: uuidv4(),
    ruleName: '',
    weight: 0,
    isConfirmed: false
  })
}
const deleteEditRuleRow = (index: number): void => {
  if (editForm.value.ruleItems.length <= 1) {
    ElMessage.warning('至少保留1条规则行')
    return
  }
  editForm.value.ruleItems.splice(index, 1)
}
const toggleEditRuleConfirm = (index: number): void => {
  const item = editForm.value.ruleItems[index]
  if (!item.isConfirmed) {
    if (!item.ruleName.trim()) {
      ElMessage.warning('请先填写规则名称')
      return
    }
    if (!Number.isInteger(item.weight) || item.weight < 0 || item.weight > 100) {
      ElMessage.warning('权重需为0-100的整数')
      return
    }
  }
  item.isConfirmed = !item.isConfirmed
}
const handleEditWeightInput = (item: RuleItem): void => {
  if (!Number.isInteger(item.weight)) {
    item.weight = Math.floor(item.weight) || 0
  }
  item.weight = Math.max(0, Math.min(100, item.weight))
}
const validateEditWeight = (item: RuleItem): void => {
  if (!Number.isInteger(item.weight) || item.weight < 0 || item.weight > 100) {
    ElMessage.warning('权重需为0-100的整数')
    item.weight = 0
  }
}

// 编辑弹窗控制
const openEditModal = (category: MajorCategory): void => {
  currentEditCategoryId.value = category.id
  editForm.value = initEditForm(category)
  editModalVisible.value = true
}
const closeEditModal = (): void => {
  editModalVisible.value = false
  editFormRef.value?.resetFields()
}

// 编辑表单提交
const convertEditToStorageFormat = (): CalculationRuleStorage => {
  const storageObj: CalculationRuleStorage = {}
  editForm.value.ruleItems
    .filter(item => item.isConfirmed && item.ruleName.trim())
    .forEach(item => {
      storageObj[item.ruleName.trim()] = item.weight
    })
  return storageObj
}
const submitEditForm = async (): Promise<void> => {
  const confirmedItems = editForm.value.ruleItems.filter(item => item.isConfirmed)
  if (confirmedItems.length === 0) {
    ElMessage.error('请至少确定1条规则行')
    return
  }

  const requestData: MajorCategoryUpdateDTO = {
    name: editForm.value.name.trim(),
    calculationRule: convertEditToStorageFormat()
  }

  const updatedCategory = await MajorCategoryService.updateCategory(
    currentEditCategoryId.value,
    requestData
  )
  updateMajorCategory(currentEditCategoryId.value, requestData)
  const idx = categories.value.findIndex(item => item.id === currentEditCategoryId.value)
  if (idx > -1) {
    categories.value[idx] = updatedCategory
  }
  ElMessage.success('专业类别修改成功')
  closeEditModal()
}
//========================================================
// 初始化页面
const initPage = async () => {
  if (isInitialized.value) return
  await loadCollegeInfo()
  await loadCategories() //加载类别
  isInitialized.value = true
}

watch(
  () => route.fullPath,
  async () => {
    console.log(route.name)
    //  这个有问题
    if (route.name !== 'MajorCategories') return
    await nextTick()
    console.log('路由变化，重新加载页面')
    await initPage()
  },
  { immediate: true }
)
//===========================================================
// 加载学院信息
const loadCollegeInfo = async () => {
  const collegeId = getCollegeIdStrFromToken()
  if (!collegeId) {
    college.value.name = '默认学院'
    return
  }

  const collegeInfo = await CollegeService.getCollegeById(collegeId)
  if (collegeInfo && collegeInfo.name) {
    college.value = collegeInfo
  } else {
    ElMessage.warning('学院信息为空，显示默认名称')
    college.value.name = '默认学院'
  }
}
//===================================================================
// 加载专业类别列表
const loadCategories = async () => {
  console.log('开始请求学院下类别数据')
  const res = await MajorCategoryService.getCategoriesByCollegeId()
  console.log('返回专业类别：', res)
  setMajorCategories(res)
  categories.value = res
}
//=====================================================================
// 日期格式化
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 删除类别
const removeCategory = async (category: MajorCategory): Promise<void> => {
  await ElMessageBox.confirm(`确定删除类别「${category.name}」吗？`, '确认删除', {
    type: 'warning'
  })
  await MajorCategoryService.deleteCategory(category.id)
  removeMajorCategory(category.id)
  categories.value = categories.value.filter(item => item.id !== category.id)
  ElMessage.success('删除成功')
}

// 专业管理页面
const manageMajors = (category: MajorCategory): void => {
  router.push(`/collegeadmin/categories/${category.id}/majors`)
}
</script>

<style scoped>
.breadcrumb {
  margin: 0 0 1rem 0;
  color: #666;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.add-btn {
  padding: 0.5rem 1rem;
}
.stats {
  margin: 1rem 0;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  padding: 0.3rem 0.6rem;
}
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.modal-form {
  width: 100%;
}
.rule-container {
  margin-top: 0.5rem;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 1rem;
}
.rule-header {
  display: flex;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #666;
}
.col-name {
  flex: 2;
  text-align: center;
}
.col-weight {
  flex: 1;
  text-align: center;
}
.col-op {
  flex: 1.5;
  text-align: center;
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 4px;
}
.confirmed-row {
  background: #f5f5f5;
  color: #999;
}
.confirmed-row .el-input__inner {
  background: #eee;
  color: #999;
  cursor: not-allowed;
}
.rule-input {
  flex: 2;
}
.weight-input {
  flex: 1;
}
.rule-op {
  flex: 1.5;
  display: flex;
  gap: 0.3rem;
  justify-content: center;
}
.btn-delete {
  color: #f56c6c;
}
.btn-confirm {
  color: #409eff;
}
.btn-cancel {
  color: #ff9900;
}
.btn-add-row {
  margin-top: 0.5rem;
  color: #409eff;
  display: inline-block;
}

.weight-summary {
  margin-top: 1rem;
  color: #666;
  font-size: 14px;
}
.text-error {
  color: #f56c6c !important;
  font-weight: 600;
}
.tip-text {
  color: #f56c6c;
  font-size: 12px;
  margin-left: 0.5rem;
}
</style>

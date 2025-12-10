<template>
  <div class="major-categories-page">
    <el-breadcrumb class="breadcrumb" separator=">">
      <el-breadcrumb-item @click="navigateToIndex" style="cursor: pointer; color: #1890ff">
        {{ college.name || '所属学院' }}学院管理员中心
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

    <!-- 添加/修改类别模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '修改专业类别' : '添加专业类别'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false">
      <el-form :model="categoryForm" label-width="80px" class="modal-form" ref="categoryFormRef">
        <!-- 类别名称 -->
        <el-form-item label="类别名称 *" prop="name">
          <el-input
            v-model="categoryForm.name"
            placeholder="请输入专业类别名称"
            class="form-control" />
        </el-form-item>

        <!-- 计算规则区域 -->
        <el-form-item label="计算规则 *" prop="calculationRule">
          <div class="rule-container">
            <!-- 规则表头 -->
            <div class="rule-header">
              <div class="col-name">规则名称</div>
              <div class="col-weight">权重（%）</div>
              <div class="col-op">操作</div>
            </div>

            <!-- 动态规则行 -->
            <div
              class="rule-row"
              v-for="(item, index) in categoryForm.ruleItems"
              :key="item.id"
              :class="{ 'confirmed-row': item.isConfirmed }">
              <!-- 规则名称输入框 -->
              <el-input
                v-model="item.ruleName"
                placeholder="如：学业绩点、竞赛加分"
                class="form-control rule-input"
                :disabled="item.isConfirmed" />

              <!-- 权重输入框（限制0-100整数） -->
              <el-input
                v-model.number="item.weight"
                type="number"
                min="0"
                max="100"
                placeholder="0-100整数"
                class="form-control rule-input weight-input"
                :disabled="item.isConfirmed"
                @input="handleWeightInput(item)"
                @blur="validateWeight(item)" />

              <!-- 操作列 -->
              <div class="rule-op">
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  class="btn-delete"
                  @click="deleteRuleRow(index)"
                  :disabled="categoryForm.ruleItems.length === 1">
                  删除
                </el-button>
                <el-button
                  type="primary"
                  text
                  class="btn-confirm"
                  @click="toggleRuleConfirm(index)"
                  :class="{ 'btn-cancel': item.isConfirmed }">
                  {{ item.isConfirmed ? '取消确定' : '确定' }}
                </el-button>
              </div>
            </div>

            <!-- 新增规则行按钮 -->
            <el-button type="text" icon="el-icon-plus" class="btn-add-row" @click="addRuleRow">
              添加规则行
            </el-button>

            <!-- 权重总和提示 -->
            <div class="weight-summary">
              已确定行权重总和：
              <span :class="{ 'text-error': totalConfirmedWeight !== 100 }">
                {{ totalConfirmedWeight }}
              </span>
              <span v-if="totalConfirmedWeight !== 100" class="tip-text">
                （需等于100才能提交）
              </span>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <!-- 弹窗底部按钮 -->
      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :disabled="totalConfirmedWeight !== 100 || !categoryForm.name.trim()">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 服务导入（适配修改后的接口）
import { CollegeService, MajorCategoryService } from '@/services'
import { useMajorCategoryStore } from '@/stores/MajorCategoryStore'
// 类型导入（适配新的DTO）
import type { MajorCategoryAddDTO, MajorCategoryUpdateDTO } from '@/services/MajorCategoryService'
import type { CalculationRuleStorage, College, MajorCategory } from '@/types'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Token工具函数
import { getCollegeIdStrFromToken, isCollegeAdmin } from '@/utils/token'

// ========== 精确类型定义（移除any） ==========
// 自定义错误类型
class RequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestError'
  }
}

// 规则行类型
interface RuleItem {
  id: string
  ruleName: string
  weight: number
  isConfirmed: boolean
}

// 表单类型
interface CategoryForm {
  id: string
  name: string
  ruleItems: RuleItem[]
}

// ========== 路由与响应式数据 ==========
const router = useRouter()
const route = useRoute()

// 移除collegeId依赖（后端从Token解析）
const modalVisible = ref(false)
const isEdit = ref(false)
const categoryFormRef = ref<FormInstance>()
// 学院信息（强化初始化）
const college = ref<College>({
  id: '',
  name: '所属学院',
  createTime: '',
  updateTime: ''
})
const categories = ref<MajorCategory[]>([])
const isInitialized = ref(false)

// Store实例
const { setMajorCategories, addMajorCategory, updateMajorCategory, removeMajorCategory } =
  useMajorCategoryStore()

// ========== 表单初始化 ==========
const initCategoryForm = (): CategoryForm => ({
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
const categoryForm = ref<CategoryForm>(initCategoryForm())

// ========== 计算属性 ==========
// 已确定权重总和（类型安全）
const totalConfirmedWeight = computed(() => {
  return categoryForm.value.ruleItems
    .filter(item => item.isConfirmed)
    .reduce((sum, item) => {
      const validWeight = Number.isInteger(item.weight) ? item.weight : 0
      return sum + (validWeight < 0 || validWeight > 100 ? 0 : validWeight)
    }, 0)
})

// ========== 初始化逻辑（适配后端Token解析） ==========
const initPage = async () => {
  if (isInitialized.value) return

  // 1. 权限校验
  if (!isCollegeAdmin()) {
    ElMessage.error('无学院管理员权限，请重新登录')
    sessionStorage.clear()
    router.push('/login')
    return
  }

  // 2. 加载数据（无需传collegeId）
  try {
    await Promise.all([loadCollegeInfo(), loadCategories()])
    isInitialized.value = true
  } catch (error) {
    const errMsg = error instanceof RequestError ? error.message : '页面初始化失败，请重试'
    ElMessage.error(errMsg)
  }
}

// 监听路由变化初始化
watch(
  () => route.fullPath,
  async () => {
    if (route.name !== 'MajorCategories') return
    await nextTick()
    await initPage()
  },
  { immediate: true }
)

// ========== 数据加载方法（适配新接口） ==========
// 加载学院信息
const loadCollegeInfo = async () => {
  try {
    const collegeId = getCollegeIdStrFromToken()
    if (!collegeId) throw new RequestError('未从Token解析到学院ID')

    const collegeInfo = await CollegeService.getCollegeById(collegeId)
    college.value = collegeInfo
  } catch (error) {
    const errMsg = error instanceof RequestError ? error.message : '加载学院信息失败'
    ElMessage.error(errMsg)
    // 兜底显示
    college.value.name = '所属学院'
  }
}

// 加载专业类别（无需传collegeId）
const loadCategories = async () => {
  try {
    const res = await MajorCategoryService.getCategoriesByCollegeId()
    setMajorCategories(res)
    categories.value = res
  } catch (error) {
    const errMsg = error instanceof RequestError ? error.message : '加载专业类别列表失败'
    ElMessage.error(errMsg)
    categories.value = []
  }
}

// ========== 工具方法 ==========
// 日期格式化（类型安全）
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

// ========== 规则行交互（类型安全） ==========
const addRuleRow = (): void => {
  categoryForm.value.ruleItems.push({
    id: uuidv4(),
    ruleName: '',
    weight: 0,
    isConfirmed: false
  })
}

const deleteRuleRow = (index: number): void => {
  if (categoryForm.value.ruleItems.length <= 1) {
    ElMessage.warning('至少保留1条规则行')
    return
  }
  categoryForm.value.ruleItems.splice(index, 1)
}

const toggleRuleConfirm = (index: number): void => {
  const item = categoryForm.value.ruleItems[index]

  if (!item.isConfirmed) {
    // 前置校验
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

const handleWeightInput = (item: RuleItem): void => {
  if (!Number.isInteger(item.weight)) {
    item.weight = Math.floor(item.weight) || 0
  }
  item.weight = Math.max(0, Math.min(100, item.weight))
}

const validateWeight = (item: RuleItem): void => {
  if (!Number.isInteger(item.weight) || item.weight < 0 || item.weight > 100) {
    ElMessage.warning('权重需为0-100的整数')
    item.weight = 0
  }
}

// ========== 模态框操作 ==========
const openAddModal = (): void => {
  isEdit.value = false
  categoryForm.value = initCategoryForm()
  modalVisible.value = true
}

const openEditModal = (category: MajorCategory): void => {
  isEdit.value = true
  // 转换数据库格式到前端规则行
  const ruleItems = Object.entries(category.calculationRule).map(([ruleName, weight]) => ({
    id: uuidv4(),
    ruleName,
    weight: Number(weight),
    isConfirmed: true
  }))

  categoryForm.value = {
    id: category.id,
    name: category.name,
    ruleItems: ruleItems.length > 0 ? ruleItems : initCategoryForm().ruleItems
  }
  modalVisible.value = true
}

const closeModal = (): void => {
  modalVisible.value = false
  categoryFormRef.value?.resetFields()
}

// 转换规则行到后端DTO格式
const convertToStorageFormat = (): CalculationRuleStorage => {
  const storageObj: CalculationRuleStorage = {}
  categoryForm.value.ruleItems
    .filter(item => item.isConfirmed && item.ruleName.trim())
    .forEach(item => {
      storageObj[item.ruleName.trim()] = item.weight
    })
  return storageObj
}

// ========== 表单提交（适配新接口） ==========
const submitForm = async (): Promise<void> => {
  const confirmedItems = categoryForm.value.ruleItems.filter(item => item.isConfirmed)
  if (confirmedItems.length === 0) {
    ElMessage.error('请至少确定1条规则行')
    return
  }

  // 构建请求数据（适配后端DTO）
  const requestData: MajorCategoryAddDTO | MajorCategoryUpdateDTO = {
    name: categoryForm.value.name.trim(),
    calculationRule: convertToStorageFormat()
  }

  try {
    if (isEdit.value) {
      // 编辑操作（无需collegeId）
      const updatedCategory = await MajorCategoryService.updateCategory(
        categoryForm.value.id,
        requestData as MajorCategoryUpdateDTO
      )
      updateMajorCategory(categoryForm.value.id, requestData)
      // 更新本地列表
      const idx = categories.value.findIndex(item => item.id === categoryForm.value.id)
      if (idx > -1) {
        categories.value[idx] = updatedCategory
      }
      ElMessage.success('专业类别修改成功')
    } else {
      // 添加操作（无需collegeId）
      const newCategory = await MajorCategoryService.addCategory(requestData as MajorCategoryAddDTO)
      addMajorCategory(newCategory)
      categories.value.push(newCategory)
      ElMessage.success('专业类别添加成功')
    }
    closeModal()
  } catch (error) {
    const errMsg = error instanceof RequestError ? error.message : '操作失败，请重试'
    ElMessage.error(errMsg)
  }
}

// ========== 删除与导航 ==========
const removeCategory = async (category: MajorCategory): Promise<void> => {
  try {
    await ElMessageBox.confirm(`确定删除类别「${category.name}」吗？`, '确认删除', {
      type: 'warning'
    })
    await MajorCategoryService.deleteCategory(category.id)
    removeMajorCategory(category.id)
    categories.value = categories.value.filter(item => item.id !== category.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel' && error instanceof RequestError) {
      ElMessage.error(error.message || '删除失败，请重试')
    }
  }
}

// 管理专业（路由跳转无需传collegeId）
const manageMajors = (category: MajorCategory): void => {
  router.push(`/collegeadmin/categories/${category.id}/majors`)
}

// 导航回首页（使用Token中的学院ID）
const navigateToIndex = (): void => {
  const cid = getCollegeIdStrFromToken()
  router.push(`/collegeadmin/${cid}`)
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

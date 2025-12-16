<script setup lang="ts">
import { createElNotificationSuccess } from '@/components/message'
import { CONFIRMED } from '@/services/Const'
import { StudentService } from '@/services/StudentService'
import { getStatusUtil } from '@/services/Utils.ts'
import type { Item, StudentItem, StudentItemResp } from '@/types'
import { DeleteFilled, EditPen, UploadFilled, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { defineAsyncComponent, nextTick, ref, toRef, toValue } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const rootItemId = toRef(() => {
  const itemid = route.params.itemid as string | undefined
  return itemid || '' // 无参数时返回空字符串
})

const selectedR = ref<{ item?: Item; sudentItem?: StudentItem }>({})

// 下载文件方法
const downloadFileF = async (fileid: string, filename: string) => {
  try {
    await StudentService.downloadStudentItemFileService(fileid, filename)
  } catch (e) {
    ElMessage.error('文件下载失败！')
    console.error('下载失败:', e)
  }
}

// 删除指标项
const { mutateAsync: mutRemoveItem } = StudentService.removeStudentItemService(rootItemId)

const resultR = ref<StudentItemResp[]>([])
const loadError = ref(false)
try {
  const studentItemsQuery = StudentService.listStudentItemsService(rootItemId)
  const { data, suspense } = studentItemsQuery
  await suspense()
  if (data.value) {
    resultR.value = data.value as StudentItemResp[]
  }
} catch (e) {
  loadError.value = true
  ElMessage.error('加载提交列表失败！')
  console.error('加载列表失败:', e)
}

const removeStudentItemF = (id: string, name: string) => {
  ElMessageBox.confirm(`确定移除，${name}，提交条目？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    try {
      await mutRemoveItem(id)
      createElNotificationSuccess('条目移除成功')
    } catch (e) {
      ElMessage.error('移除条目失败！')
      console.error('移除失败:', e)
    }
  })
}

// 删除附件
const { mutateAsync: mutRemoveFile } = StudentService.removeStudentItemFileService(
  toValue(rootItemId)
)
const removeStudentItemFileF = async (id: string, name: string) => {
  ElMessageBox.confirm(`确定移除，${name}，文件？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    try {
      await mutRemoveFile(id)
      createElNotificationSuccess('文件移除成功')
    } catch (e) {
      ElMessage.error('移除文件失败！')
      console.error('移除文件失败:', e)
    }
  })
}

// 文件上传
const fileR = ref<File>()
const fileInputR = ref<HTMLInputElement>()
const submitIndexR = ref(-1)
const activeF = (index: number) => {
  if (!rootItemId.value) {
    ElMessage.warning('请先选择具体的指标项分类！')
    return
  }

  nextTick(() => {
    fileInputR.value?.click()
    fileR.value = undefined
    ;(fileInputR.value as HTMLInputElement).value = ''
  })
  submitIndexR.value = index
}

const { mutateAsync: mutUploadFile } = StudentService.uploadStudentItemFileService(
  toValue(rootItemId)
)
const changeF = async (event: Event) => {
  const fileList = (event.target as HTMLInputElement).files
  if (!fileList) return

  fileR.value = fileList[0]
  if (!resultR.value || submitIndexR.value < 0 || submitIndexR.value >= resultR.value.length) {
    ElMessage.error('未找到对应的提交项！')
    return
  }

  const studentItem = resultR.value[submitIndexR.value]

  if (!fileR.value) {
    ElMessage.error('请选择上传文件')
    return
  }

  try {
    const fName = fileR.value.name
    const fdata = new FormData()
    fdata.append('uploadFile', fileR.value, `${studentItem.itemName}-${fName}`)

    await mutUploadFile({ fdata, stuitemid: studentItem.id ?? '' })
    createElNotificationSuccess('佐证文件上传成功')

    // 清空文件选择
    ;(fileInputR.value as HTMLInputElement).value = ''
    fileR.value = undefined
  } catch (e) {
    ElMessage.error('文件上传失败！')
    console.error('上传失败:', e)
  }
}

// 编辑弹窗
const editDialogVisable = ref(false)
const activeEditF = (stud: StudentItemResp) => {
  if (!stud) return

  selectedR.value.item = {
    id: stud.id,
    name: stud.itemName,
    maxPoints: stud.maxPoints,
    maxItems: stud.maxItems
  }
  selectedR.value.sudentItem = {
    id: stud.id,
    name: stud.name,
    comment: stud.comment,
    rootItemId: stud.rootItemId,
    itemId: stud.itemId
  }
  editDialogVisable.value = true
}

const closeF = () => (editDialogVisable.value = false)
const StudentItemDialog = defineAsyncComponent(() => import('./EditDialog.vue'))

const allowUpdate = (stuItem: StudentItemResp) => stuItem.status !== CONFIRMED

// 日志弹窗
const selectStuItemLogIdR = ref('')
const getLogsF = (itemid: string) => {
  if (!itemid) return
  selectStuItemLogIdR.value = itemid
  logActiveR.value = true
}

const logActiveR = ref(false)
const logdialog = defineAsyncComponent(() => import('./LogDialog.vue'))
const closeLogDialF = () => {
  logActiveR.value = false
}
</script>

<template>
  <div v-if="!rootItemId">
    <el-empty description="请先选择左侧具体的指标项分类"></el-empty>
  </div>
  <div v-else-if="loadError">
    <el-empty description="加载数据失败，请刷新页面重试"></el-empty>
  </div>
  <div v-else-if="!resultR || resultR.length === 0">
    <el-empty description="暂无提交记录"></el-empty>
  </div>
  <el-table v-else :data="resultR" style="width: 100%">
    <el-table-column type="index" width="50" />
    <el-table-column prop="itemName" label="指标点" width="180" />
    <el-table-column prop="name" label="标题" width="180" />
    <el-table-column label="佐证" min-width="240">
      <template #default="scope">
        <div v-if="allowUpdate(scope.row)">
          <input type="file" ref="fileInputR" hidden @change="changeF" />
          <el-icon
            class="my-action-icon"
            color="#409EFF"
            style="font-size: 24px"
            @click="activeF(scope.$index)">
            <UploadFilled />
          </el-icon>
          <span>{{ fileR?.name }}</span>
        </div>
        <div v-for="file of scope.row.files" :key="file.id">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="file.filename"
            placement="top"
            :hide-after="0">
            <el-tag size="large" style="margin-right: 8px" disable-transitions>
              <span
                class="tag-ellipsis"
                type="primary"
                size="large"
                @click="downloadFileF(file.id!, file.filename!)">
                {{ file.filename }}
              </span>
            </el-tag>
          </el-tooltip>

          <el-icon
            v-if="allowUpdate(scope.row)"
            color="#F56C6C"
            class="my-action-icon"
            @click="removeStudentItemFileF(file.id!, file.filename!)">
            <DeleteFilled />
          </el-icon>
        </div>
        <br />
      </template>
    </el-table-column>
    <el-table-column label="认定">
      <template #default="scope">
        <div>
          <el-tag type="success" size="large">
            {{ scope.row.point ?? 0 }}
          </el-tag>
          <span style="vertical-align: middle">/ {{ scope.row.maxPoints }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="状态">
      <template #default="scope">
        <el-tag :type="getStatusUtil(scope.row.status ?? '')?.color">
          {{ getStatusUtil(scope.row.status ?? '')?.name }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="日志">
      <template #default="scope">
        <el-icon class="my-action-icon" color="#409EFF" @click="getLogsF(scope.row.id)">
          <View />
        </el-icon>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="80">
      <template #default="scope">
        <el-icon
          v-if="allowUpdate(scope.row)"
          class="my-action-icon"
          color="#409EFF"
          @click="activeEditF(scope.row)">
          <EditPen />
        </el-icon>
        <el-icon
          v-if="allowUpdate(scope.row)"
          class="my-action-icon"
          color="#F56C6C"
          @click="removeStudentItemF(scope.row.id!, scope.row.name!)">
          <DeleteFilled />
        </el-icon>
      </template>
    </el-table-column>
  </el-table>

  <StudentItemDialog
    v-if="editDialogVisable"
    :item="selectedR.item!"
    :studentitem="selectedR.sudentItem!"
    :rootitemid="rootItemId"
    :close="closeF" />

  <logdialog :stu-item-id="selectStuItemLogIdR" :close="closeLogDialF" v-if="logActiveR" />
</template>
<style scoped>
.tag-ellipsis {
  padding: 5px 0;
  cursor: pointer;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.my-action-icon {
  cursor: pointer;
  margin: 0 2px;
}
</style>

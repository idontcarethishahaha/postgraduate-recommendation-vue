<script setup lang="ts">
//可用
import { createElNotificationSuccess } from '@/components/message'
import { CONFIRMED } from '@/services/Const'
import { StudentService } from '@/services/StudentService'
import { getStatusUtil } from '@/services/Utils.ts'
import type { Item, StudentItem, StudentItemResp } from '@/types'
import { DeleteFilled, EditPen, UploadFilled, View } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { defineAsyncComponent, nextTick, ref, toRef, toValue } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const rootItemId = toRef(() => route.params.itemid as string)
const selectedR = ref<{ item?: Item; sudentItem?: StudentItem }>({})
//
const downloadFileF = async (fileid: string, filename: string) => {
  await StudentService.downloadStudentItemFileService(fileid, filename)
}
const { mutateAsync: mutRemoveItem } = StudentService.removeStudentItemService(rootItemId)
const { data: resultR, suspense } = StudentService.listStudentItemsService(rootItemId)
await suspense()
const removeStudentItemF = (id: string, name: string) => {
  ElMessageBox.confirm(`确定移除，${name}，提交条目？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await mutRemoveItem(id)
    createElNotificationSuccess('条目移除成功')
  })
}

//
const { mutateAsync: mutRemoveFile } = StudentService.removeStudentItemFileService(
  toValue(rootItemId)
)
const removeStudentItemFileF = async (id: string, name: string) => {
  ElMessageBox.confirm(`确定移除，${name}，文件？`, 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await mutRemoveFile(id)
    createElNotificationSuccess('文件移除成功')
  })
}

//
const fileR = ref<File>()
const fileInputR = ref<HTMLInputElement>()
const submitIndexR = ref(-1)
const activeF = (index: number) => {
  // 同步更新元素属性值
  nextTick(() => {
    fileInputR.value?.click()
    fileR.value = undefined
    ;(fileInputR.value as HTMLInputElement).value = ''
  })
  submitIndexR.value = index
}

//
const { mutateAsync: mutUploadFile } = StudentService.uploadStudentItemFileService(
  toValue(rootItemId)
)
const changeF = async (event: Event) => {
  const fileList = (event.target as HTMLInputElement).files
  if (!fileList) return
  fileR.value = fileList[0]
  const studentItem = resultR.value![submitIndexR.value]

  if (!fileR.value) {
    throw '请选择上传文件'
  }
  const fName = fileR.value.name
  const fdata = new FormData()
  fdata.append('file', fileR.value, `${studentItem.itemName}-${fName}`)

  await mutUploadFile({ fdata, stuitemid: studentItem.id ?? '' })
  createElNotificationSuccess('佐证文件上传成功')

  // 再次选择时，需清空值
  ;(fileInputR.value as HTMLInputElement).value = ''
  fileR.value = undefined
}

const editDialogVisable = ref(false)

const activeEditF = (stud: StudentItemResp) => {
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

const selectStuItemLogIdR = ref('')
//
const getLogsF = (itemid: string) => {
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
  <el-table :data="resultR as StudentItemResp" style="width: 100%">
    <el-table-column type="index" width="50" />
    <el-table-column prop="itemName" label="指标点" width="180">
      <template #default="scope">
        {{ (scope.row as StudentItemResp).itemName }}
      </template>
    </el-table-column>
    <el-table-column label="标题" width="180">
      <template #default="scope">
        {{ (scope.row as StudentItemResp).name }}
      </template>
    </el-table-column>
    <el-table-column label="佐证" min-width="240">
      <template #default="scope">
        <div v-if="allowUpdate(scope.row as StudentItemResp)">
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
        <div v-for="file of (scope.row as StudentItemResp).files" :key="file.id">
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
            v-if="allowUpdate(scope.row as StudentItemResp)"
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
            {{ (scope.row as StudentItemResp).point ?? 0 }}
          </el-tag>
          <span style="vertical-align: middle">
            / {{ (scope.row as StudentItemResp).maxPoints }}
          </span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="状态">
      <template #default="scope">
        <el-tag :type="getStatusUtil((scope.row as StudentItemResp).status ?? '')?.color">
          {{ getStatusUtil((scope.row as StudentItemResp).status ?? '')?.name }}
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
          v-if="allowUpdate(scope.row as StudentItemResp)"
          class="my-action-icon"
          color="#409EFF"
          @click="activeEditF(scope.row as StudentItemResp)">
          <EditPen />
        </el-icon>
        <el-icon
          v-if="allowUpdate(scope.row as StudentItemResp)"
          class="my-action-icon"
          color="#F56C6C"
          @click="
            removeStudentItemF(
              (scope.row as StudentItemResp).id!,
              (scope.row as StudentItemResp).name!
            )
          ">
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
</style>

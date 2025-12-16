<script setup lang="ts">
import AddStudentItemView from '@/views/main/student/studentitems/items/AddStudentItemView.vue'
import SubmitList from '@/views/main/student/studentitems/SubmitList.vue'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const hasItemId = !!route.params.itemid && !isNaN(Number(route.params.itemid))

// 挂载时检查：如果无有效itemid，跳回学生首页
onMounted(() => {
  if (!hasItemId) {
    router.push('/student')
  }
})
</script>

<template>
  <el-row class="my-row" v-if="hasItemId">
    <el-col :span="2">
      <AddStudentItemView />
    </el-col>
    <el-col :span="18">
      <p>
        说明:1.添加全面发展成绩指标项;2.在创建指标项的佐证条目处，选择上传指标项对应的
        <el-tag type="primary" style="vertical-align: middle">佐证材料</el-tag>
        ;
      </p>
    </el-col>
    <el-col>
      <SubmitList />
    </el-col>
  </el-row>
</template>

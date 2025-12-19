<script setup lang="ts">
import AddStudentItemView from '@/views/main/student/studentitems/items/AddStudentItemView.vue'
import SubmitList from '@/views/main/student/studentitems/SubmitList.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute() //获取当前路由参数
const router = useRouter() // 执行路由跳转操作

//!! 将任意值转为布尔值
// 判断路由参数 itemid 是否 “存在，判断itemid转换为数字后是否为有效数字
const hasItemId = !!route.params.itemid && !isNaN(Number(route.params.itemid))

//开头分号 ; 为了防止前一行代码忘记分号导致的错误
//立即执行函数，参数无效时强制跳转到学生首页
;(() => {
  if (!hasItemId) {
    router.push('/student')
  }
})()
</script>

<template>
  <el-row class="my-row" v-if="hasItemId">
    <el-col :span="2">
      <AddStudentItemView />
    </el-col>
    <el-col :span="18">
      <p>
        说明:1.添加全面发展成绩指标项;2.在创建指标项的佐证条目处，选择上传指标项对应的
        <span style="color: #409eff; font-weight: 700; vertical-align: middle">佐证材料</span>
        ;
      </p>
    </el-col>
    <el-col>
      <SubmitList />
    </el-col>
  </el-row>
</template>

<style scoped>
.my-row {
  padding: 16px;
}
</style>

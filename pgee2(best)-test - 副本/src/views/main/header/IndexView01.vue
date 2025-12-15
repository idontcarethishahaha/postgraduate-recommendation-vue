<script lang="ts" setup>
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { ADMIN, COLLEGE_ADMIN, COUNSELOR, STUDENT } from '@/services/Const'
import { StudentService } from '@/services/StudentService'
import type { Item, MajorCategory } from '@/types'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LogoutView from './LogoutView.vue'
import SettingView from './SettingView.vue'
//
const role = CommonService.getRoleService()
let result:
  | ReturnType<typeof StudentService.listTopLevelItemsService>
  | ReturnType<typeof CollegeService.listCategoriesService>
  | unknown

if (role === STUDENT) {
  result = StudentService.listTopLevelItemsService()
}
if (role === COLLEGE_ADMIN || role === COUNSELOR) {
  result = CollegeService.listCategoriesService()
}
if (role === ADMIN) {
  result = { suspense: () => Promise.resolve(), data: [] }
}

const { data, suspense } = result as { suspense: () => Promise<void>; data: unknown }
await suspense()
//
const menusMapR = computed(() => {
  const menusMap = new Map<string, string>()
  if (role === STUDENT) {
    menusMap.set('中心', '/student')
    menusMap.set('加权成绩', '/student/weightedscore')
    const level1Items = data as Item[]
    level1Items.forEach(item => {
      menusMap.set(item.name ?? '', `/student/studentitems/${item.id}`)
    })
  }

  if (role === COLLEGE_ADMIN || role === COUNSELOR) {
    menusMap.set('中心', '/college')
    const categories = data as MajorCategory[]
    categories.forEach(cat => menusMap.set(cat.name ?? '', `/college/categories/${cat.id}`))
    if (role === COLLEGE_ADMIN) {
      menusMap.set('功能', '/college/functions')
    }
  }
  return menusMap
})
//
const route = useRoute()
const activeIndexR = computed(() => {
  // 匹配最符合当前路径的menu
  const pathArray = route.fullPath.split('/')
  let count = 0
  let pName = ''
  for (const [menuName, nemuPath] of menusMapR.value) {
    const countTemp = nemuPath.split('/').filter(np => pathArray.includes(np)).length
    if (countTemp > count) {
      count = countTemp
      pName = menuName
    }
  }
  return menusMapR.value.get(pName)
})
</script>
<template>
  <el-row class="my-row" style="padding: 3px" align="middle">
    <el-col :span="4">
      <SettingView />
    </el-col>

    <el-col :span="16">
      <el-menu :default-active="activeIndexR" mode="horizontal" router>
        <el-menu-item v-for="(menu, index) of menusMapR" :key="index" :index="menu[1]">
          {{ menu[0] }}
        </el-menu-item>
      </el-menu>
    </el-col>
    <!--  -->
    <el-col :span="4" style="text-align: right; padding-right: 10px">
      <LogoutView />
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'

import { ADMIN, COLLEGE_ADMIN, COUNSELOR, STUDENT } from '@/services/Const'
import { StudentService } from '@/services/StudentService'
import type { Item, MajorCategory } from '@/types'
import { computed, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import LogoutView from './LogoutView.vue'
import SettingView from './SettingView.vue'

// 获取当前角色
const role = CommonService.getRoleService()

let result:
  | ReturnType<typeof StudentService.listTopLevelItemsService>
  | ReturnType<typeof CollegeService.listCategoriesService>
  | { suspense: () => Promise<unknown>; data: Ref<unknown> }

if (role === STUDENT) {
  result = StudentService.listTopLevelItemsService()
} else if (role === COLLEGE_ADMIN || role === COUNSELOR) {
  result = CollegeService.listCategoriesService()
} else if (role === ADMIN) {
  result = { suspense: () => Promise.resolve(), data: ref([]) }
} else {
  result = { suspense: () => Promise.resolve(), data: ref([]) }
}

const { data, suspense } = result
await suspense()

//菜单Map
const menusMapR = computed(() => {
  const menusMap = new Map<string, string>()
  if (role === STUDENT) {
    menusMap.set('个人中心', '/student')
    menusMap.set('加权成绩', '/student/weightedscore')
    const allItems = data.value as Item[]

    const level1Items = allItems.filter(
      item => !item.parentId || item.parentId === '0' || item.parentId === ''
    )
    console.log('所有指标数据:', allItems)
    console.log('过滤后的一级指标:', level1Items)
    // 循环添加
    level1Items.forEach(item => {
      menusMap.set(item.name ?? '', `/student/studentitems/${item.id}`)
    })
  }

  if (role === COLLEGE_ADMIN || role === COUNSELOR) {
    menusMap.set('个人中心', '/college')
    const categories = data.value as MajorCategory[]
    categories.forEach(cat => menusMap.set(cat.name ?? '', `/college/categories/${cat.id}`))
    if (role === COLLEGE_ADMIN) {
      menusMap.set('功能栏', '/college/functions')
    }
  }
  return menusMap
})

// 匹配激活菜单
const route = useRoute()
const activeIndexR = computed(() => {
  const pathArray = route.fullPath.split('/')
  let count = 0
  let pName = ''
  for (const [menuName, menuPath] of menusMapR.value) {
    const countTemp = menuPath.split('/').filter(np => pathArray.includes(np)).length
    if (countTemp > count) {
      count = countTemp
      pName = menuName
    }
  }
  return menusMapR.value.get(pName) || ''
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

    <el-col :span="4" style="text-align: right; padding-right: 10px">
      <LogoutView />
    </el-col>
  </el-row>
</template>

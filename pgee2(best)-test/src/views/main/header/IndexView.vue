<script lang="ts" setup>
import { CollegeService } from '@/services/CollegeService'
import { CommonService } from '@/services/CommonService'
import { ADMIN, COLLEGE_ADMIN, COUNSELOR, STUDENT } from '@/services/Const'
import { StudentService } from '@/services/StudentService'
import type { Item, MajorCategory } from '@/types'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import LogoutView from './LogoutView.vue'
import SettingView from './SettingView.vue'

// 获取当前角色
const role = CommonService.getRoleService()

type ResultType = UseQueryReturnType<unknown, Error> & {
  suspense: () => Promise<unknown>
}

// 初始化默认值
let result: ResultType = {
  data: ref<unknown>([]),
  suspense: () => Promise.resolve(),
  isLoading: ref(false),
  isPending: ref(false),
  isError: ref(false),
  error: ref<Error | null>(null),
  promise: ref(Promise.resolve())
} as ResultType

// 根据角色初始化对应服务
if (role === STUDENT) {
  result = StudentService.listTopLevelItemsService() as ResultType
}
if (role === COLLEGE_ADMIN || role === COUNSELOR) {
  result = CollegeService.listCategoriesService() as ResultType
}
if (role === ADMIN) {
}

const { data, suspense } = result
await suspense() // 等待异步请求完成

//菜单Map
const menusMapR = computed(() => {
  const menusMap = new Map<string, string>()
  if (role === STUDENT) {
    menusMap.set('个人中心', '/student')
    menusMap.set('加权成绩', '/student/weightedscore')
    const level1Items = data.value as Item[]
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

// 将Map转为数组
const menusArrayR = computed(() => Array.from(menusMapR.value.entries()))

// 匹配当前激活菜单
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
        <el-menu-item v-for="(menu, index) of menusArrayR" :key="index" :index="menu[1]">
          {{ menu[0] }}
        </el-menu-item>
      </el-menu>
    </el-col>

    <el-col :span="4" style="text-align: right; padding-right: 10px">
      <LogoutView />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
//标签切换器 + 动态组件渲染

//定义组件入参：接收一个Map，key是组件名称（字符串），value是Vue组件（Component类型）
const props = defineProps<{ tagcoms: Map<string, Component> }>()
//存储当前选中的组件名称（初始为空）
const curComNameR = ref('')
//将传入的组件Map赋值给局部变量
const componentsMap = props.tagcoms
//根据选中的名称，从Map中获取当前要渲染的组件
const getCurComF = () => componentsMap.get(curComNameR.value)
//选中的标签用danger（红色），未选中用primary（蓝色）
const typeF = (name: string) => (name == curComNameR.value ? 'danger' : 'primary')
/*
 com[0] = 数组第 1 个元素 = Map 的 key
com[1] = 数组第 2 个元素 = Map 的 value
typeF(com[0]) → 把标签名称传给样式函数，判断是否要变红 / 变蓝
*/
</script>

<template>
  <el-row class="my-row">
    <el-col>
      <!--基于componentsMap组件映射表的key-value对循环渲染标签，调用typeF函数，传入标签名称（com[0]），返回danger/primary，curComNameR存储当前选中的标签名称，将当前标签的名称（com[0]）赋值给curComNameR，标记为“选中” -->
      <el-check-tag
        checked
        v-for="(com, index) of componentsMap"
        :type="typeF(com[0])"
        :key="index"
        @click="curComNameR = com[0]"
        style="margin-right: 10px">
        <!--  标签显示的文字：com[0]是Map的key -->
        {{ com[0] }}
      </el-check-tag>
    </el-col>
  </el-row>
  <!--
  v-if 直接写在 <component> 上也可以
    <component v-if="curComNameR" :is="getCurComF()" />
    -->
  <!-- 条件渲染,仅当curComNameR有值（选中了标签）时，才渲染下方内容 -->
  <template v-if="curComNameR">
    <!-- Vue内置的动态组件,核心是:is属性，指定要渲染的组件 -->
    <component :is="getCurComF()" />
  </template>
</template>

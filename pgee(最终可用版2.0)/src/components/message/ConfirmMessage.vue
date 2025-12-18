<script setup lang="ts">
import { ElDialog } from 'element-plus' //对话框
import { ref } from 'vue'

const props = withDefaults(
  //props接收父组件传递的消息内容和关闭回调
  defineProps<{
    message: string
    close?: () => void
  }>(),
  {
    message: '',
    close: () => {}
  }
)

const dialogVisibleR = ref(true) //组件挂载后默认显示弹窗

const handleClose = () => {
  props.close() //调用父组件传入的close回调
  dialogVisibleR.value = false //隐藏弹窗
}
</script>

<template>
  <el-dialog
    v-model="dialogVisibleR"
    title="消息"
    width="30%"
    @close="handleClose"
    destroy-on-close>
    <!--父组件传递的消息-->
    <span>{{ message }}</span>
  </el-dialog>
</template>

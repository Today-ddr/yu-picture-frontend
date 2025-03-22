<template>
  <div>
    <a-modal v-model:visible="visible" :title="title" :footer="false" @cancel="closeModal">
      <h4>复制分享链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <div style="margin-bottom: 16px"></div>
      <h4>手机扫码分享</h4>
      <a-qrcode :value="link" icon="../src/assets/logo.png" error-level="H"/>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  title: string
  link: string
}
const props = withDefaults(defineProps<Props>(), {
  title: '分享图片',
  link: 'https://www.baidu.com',
})

//是否可见
const visible = ref(false)
//打开弹窗
const openModal = () => {
  visible.value = true
}
//滑膜弹窗
const closeModal = () => {
  visible.value = false
}
//暴漏函数给父组件
defineExpose({
  openModal
})
</script>

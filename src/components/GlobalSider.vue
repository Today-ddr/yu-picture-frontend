<template>
  <div id="globalSider">
    <a-layout-sider v-if="loginUserStore.loginUser.id" width="200" breakpoint="lg">
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const current = ref<string[]>([''])
const loginUserStore = useLoginUserStore()
//菜单项
const menuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    icon: () => h(UserOutlined),
    label: '我的空间',
  },
]

//路由跳转事件
const router = useRouter()
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}
//监听路由变化，控制菜单栏高亮
router.afterEach((to) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}
</style>

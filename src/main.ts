import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/access.ts'
import zhCN from 'ant-design-vue/es/locale/zh_CN' // 引入中文语言包
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' //引入dayjs的中文语言包
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const app = createApp(App)
// 设置 dayjs 的语言为中文
dayjs.locale('zh-cn')
app.provide('locale', zhCN)
app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(VueCropper)
app.mount('#app')

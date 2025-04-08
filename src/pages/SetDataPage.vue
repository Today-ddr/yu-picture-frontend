<template>
  <div id="setDataPage">
    <a-form name="userForm" :label-col="{ span: 3 }" :model="userForm" @finish="handleSubmit">
      <h2>修改账号资料</h2>
      <div style="margin-bottom: 25px" />
      <a-form-item name="userAccount" label="账号">
        <span>{{ userForm.userAccount }}</span>
      </a-form-item>
      <div class="avatar-upload">
        <a-form-item name="userAvatar" label="头像">
          <a-upload
            list-type="picture-card"
            :show-upload-list="false"
            :custom-request="handleUpload"
            :before-upload="beforeUpload"
          >
            <img v-if="userForm.userAvatar" :src="userForm.userAvatar" alt="avatar" />
            <div v-else>
              <div class="ant-upload-text">上传头像</div>
            </div>
          </a-upload>
        </a-form-item>
      </div>
      <a-form-item name="userName" label="用户名">
        <a-input v-model:value="userForm.userName" placeholder="请输入名称" allow-clear />
      </a-form-item>
      <a-form-item name="userProfile" label="简介">
        <a-textarea
          v-model:value="userForm.userProfile"
          placeholder="请输入简介"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="createTime" label="注册时间">
        <span>{{ dayjs(userForm.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
      </a-form-item>
      <a-form-item name="userId" label="id">
        <span>{{ userForm.id }}</span>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
        <a-button type="primary" html-type="submit" style="width: 100%">保存修改</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  getLoginUserUsingGet,
  setUserDataUsingPost,
  uploadAvatarUsingPost,
} from '@/api/userController.ts'
import { message, type UploadProps } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const userForm = reactive<API.LoginUserVO>({})
// 获取用户基本信息
const getUserData = async () => {
  const res = await getLoginUserUsingGet()
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data
    userForm.id = data.id
    userForm.userAccount = data.userAccount
    userForm.userName = data.userName
    userForm.userAvatar = data.userAvatar
    userForm.createTime = data.createTime
    userForm.userProfile = data.userProfile
  } else {
    message.error('用户信息加载失败，' + res.data.message)
  }
}

//头像组件
const loading = ref<boolean>(false)
const avatarUrl = ref<API.UserVO>()

/**
 * 上传头像
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const res = await uploadAvatarUsingPost({}, file)
    if (res.data.code === 0 && res.data.data) {
      avatarUrl.value = res.data.data
      userForm.userAvatar = avatarUrl.value?.userAvatar
      userForm.avatarThumbnail = avatarUrl.value?.avatarThumbnail
      message.success('头像上传成功')
    } else {
      message.error('头像上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('头像上传失败', error)
    message.error('头像上传失败，', +error.message)
  }
  loading.value = false
}

/**
 * 上传前的校验
 * @param file
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐 jpg 或 png')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('不能上传超过 2M 的图片')
  }
  return isJpgOrPng && isLt2M
}
const router = useRouter()
const loginUserStore = useLoginUserStore()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const userId = userForm.id
  if (!userId) {
    return
  }
  const res = await setUserDataUsingPost({
    ...userForm,
  })
  //操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('修改成功')
    //更新登录用户信息，让 GlobalHeader 响应更新
    await loginUserStore.fetchLoginUser()
    router.push({ path: '/' })
  } else {
    message.error('修改失败，' + res.data.message)
  }
}

onMounted(() => {
  getUserData()
})
</script>

<style scoped>
#setDataPage {
  max-width: 720px;
  margin: 0 auto;
}

.avatar-upload :deep(.ant-upload) {
  min-width: 152px;
  min-height: 152px;
}

.avatar-upload img {
  max-width: 120px;
  max-height: 120px;
}
</style>

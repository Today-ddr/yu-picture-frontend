<template>
  <div id="userManagePage">
    <!--搜索表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px" />
    <!--表格-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAccount'">
          <div v-if="editableData[record.id]">
            <a-input v-model:value="editableData[record.id].userAccount" />
          </div>
          <div v-else>
            {{ record.userAccount }}
          </div>
        </template>
        <template v-if="column.dataIndex === 'userName'">
          <div v-if="editableData[record.id]">
            <a-input v-model:value="editableData[record.id].userName" />
          </div>
          <div v-else>
            {{ record.userName }}
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'userProfile'">
          <div v-if="editableData[record.id]">
            <a-input v-model:value="editableData[record.id].userProfile" />
          </div>
          <div v-else>
            {{ record.userProfile }}
          </div>
        </template>
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="50" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="editableData[record.id]">
            <a-select v-model:value="editableData[record.id].userRole" style="width: 120px">
              <a-select-option value="admin">管理员</a-select-option>
              <a-select-option value="user">普通用户</a-select-option>
            </a-select>
          </div>
          <div v-else>
            <a-tag :color="record.userRole === 'admin' ? 'green' : 'blue'">
              {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="editable-row-operations">
            <span v-if="editableData[record.id]">
              <a-button type="primary" ghost @click="save(record.id)">保存</a-button>
              <a-popconfirm title="确定取消？" @confirm="cancel(record.id)">
                <a-button danger style="margin-left: 8px">取消</a-button>
              </a-popconfirm>
            </span>
            <span v-else>
              <a-button type="primary" ghost @click="edit(record.id)" style="margin-left: 8px"
                >编辑</a-button
              >
              <a-button danger @click="doDelete(record.id)" style="margin-left: 8px">删除</a-button>
            </span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref, type UnwrapRef } from 'vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost, updateUserUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'
import dayjs from 'dayjs'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    width: 150,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 120,
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    width: 100,
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    width: 200,
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
  },
]

//定义数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
//搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
})

//获取数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败,' + res.data.message)
  }
}
//页面加载
onMounted(() => {
  fetchData()
})
//分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})
//表格变化之后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}
//搜索数据
const doSearch = () => {
  //重置页码
  searchParams.current = 1
  fetchData()
}
//删除数据
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    //刷新数据
    await fetchData()
  } else {
    message.error('删除失败')
  }
}

//操作按钮
const editableData: UnwrapRef<Record<string, API.UserVO>> = reactive({})

const edit = (key: string) => {
  const target = dataList.value.find((item) => item.id === key)
  if (target) {
    editableData[key] = cloneDeep(target)
  }
}

const save = async(key: string) => {
  const target = dataList.value.find((item) => item.id === key)
  if (target && editableData[key]) {
    Object.assign(target, editableData[key])
    const res = await updateUserUsingPost({
      ...editableData[key],
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('保存成功')
    } else {
      message.error('保存失败,' + res.data.message)
    }
    delete editableData[key]
  }
}

const cancel = (key: string) => {
  delete editableData[key]
}
</script>

<template>
  <div style="position: relative;height: 100%;width: 100%">
    <van-pull-refresh
        v-model="refreshLoading"
        success-text="刷新成功"
        @refresh="onRefresh"
    >
      <van-list
          v-model:loading="listLoading"
          :finished="listFinished"
          offset="0"
          finished-text="没有更多了"
          @load="onLoad"
      >
        <UserCardList :user-list="userList"/>
      </van-list>
    </van-pull-refresh>
    <van-back-top right="20px" bottom="60px"/>
    <van-empty v-if="(!userList ||　userList.length===0) && listLoading===false" image="search"
               description="暂无符合要求的用户"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute } from "vue-router"
import myAxios from "../plugins/my-axios"
import { showFailToast } from "vant"
import qs from 'qs'
import UserCardList from "../components/UserCardList.vue"
import type { UserType, ApiResponse } from '../types/user'

interface SearchResponse {
  records: UserType[]
}

interface SearchParams {
  currentPage: number
  tagNameList: string | string[]
}

const route = useRoute()
const { tags } = route.query
const userList = ref<UserType[]>([])
const currentPage = ref(0)
const refreshLoading = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)

async function getSearchResult(currentPage: number) {
  const res = await myAxios.get<ApiResponse<SearchResponse>>("/user/search/tags", {
    params: {
      currentPage,
      tagNameList: tags
    } as SearchParams,
    paramsSerializer: (params: SearchParams) => {
      return qs.stringify(params, { indices: false })
    }
  })

  if (res.data.code === 0) {
    if (res.data.data.records.length !== 0) {
      res.data.data.records.forEach((user: UserType) => {
        if (typeof user.tags === 'string') {
          user.tags = JSON.parse(user.tags)
        }
        user.status = user.userStatus
        user.role = user.userRole
        user.isFollow = false
        user.updateTime = user.createTime
      })
      userList.value.push(...res.data.data.records)
    } else {
      listFinished.value = true
    }
  } else {
    showFailToast("搜索失败" + (res.data.description ? `,${res.data.description}` : ''))
    listFinished.value = true
  }
}

const onLoad = async () => {
  currentPage.value++
  await getSearchResult(currentPage.value)
  listLoading.value = false
}

const onRefresh = async () => {
  currentPage.value = 1
  userList.value = []
  await getSearchResult(currentPage.value)
  refreshLoading.value = false
  listLoading.value = false
}
</script>

<style scoped>

</style>

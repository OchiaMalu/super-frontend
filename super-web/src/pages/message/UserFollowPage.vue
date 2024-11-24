<template>
  <van-pull-refresh
      v-model="refreshLoading"
      success-text="刷新成功"
      @refresh="followReload">
    <!--    todo 用户搜索-->
    <van-list
        v-model:loading="listLoading"
        :finished="listFinished"
        offset="0"
        @load="followLoad"
        style="margin: 15px;height: 100%"
    >
      <template #finished>
        <span v-if="userList.length !== 0">没有更多了</span>
      </template>
      <template #loading>
        <van-loading vertical>
          <template #icon>
            <van-icon name="star-o" size="30"/>
          </template>
          加载中...
        </van-loading>
      </template>
      <user-card-list :user-list="userList"/>
    </van-list>
    <van-back-top right="20px" bottom="60px"/>
    <van-empty
        v-if="(!userList || userList.length===0) && listLoading===false"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
        image-size="80"
        description="您暂无关注的用户"
    />
  </van-pull-refresh>
</template>

<script setup lang="ts">
import { ref } from "vue";
import myAxios from "../../plugins/my-axios";
import UserCardList from "../../components/UserCardList.vue";

interface User {
  id: number;
  username: string;
  tags?: string | string[];
  userAccount: string;
  gender: number;
  phone: string;
  email: string;
  avatarUrl?: string;
  isFollow?: boolean;
  // 根据实际用户对象添加其他属性
}

// 响应式状态定义
const loading = ref<boolean>(true);
const userList = ref<User[]>([]);
const refreshLoading = ref<boolean>(false);
const listLoading = ref<boolean>(false);
const listFinished = ref<boolean>(false);
const userFollowCurrentPage = ref<number>(0);

// 获取关注列表
const getUserFollow = async (currentPage: number): Promise<void> => {
  try {
    const res = await myAxios.get("/follow/my", {
      params: { currentPage }
    });

    if (res?.data.code === 0) {
      if (res.data.data.records.length > 0) {
        res.data.data.records.forEach((user: User) => {
          if (user.tags && typeof user.tags === 'string') {
            user.tags = JSON.parse(user.tags);
          }
        });
        res.data.data.records.forEach((item: User) => userList.value.push(item));
      } else {
        listFinished.value = true;
      }
      listLoading.value = false;
    }
  } catch (error) {
    console.error('Failed to fetch follow list:', error);
    listLoading.value = false;
  }
};

// 加载更多关注
const followLoad = async (): Promise<void> => {
  userFollowCurrentPage.value++;
  await getUserFollow(userFollowCurrentPage.value);
};

// 重新加载关注列表
const followReload = async (): Promise<void> => {
  try {
    userFollowCurrentPage.value = 1;
    userList.value = [];
    listFinished.value = false;
    await getUserFollow(userFollowCurrentPage.value);
  } catch (error) {
    console.error('Failed to reload follow list:', error);
  } finally {
    refreshLoading.value = false;
    listLoading.value = false;
  }
};
</script>

<style scoped>

</style>

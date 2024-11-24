<template>
  <van-pull-refresh
      v-model="refreshLoading"
      success-text="刷新成功"
      @refresh="likeReload">
    <!--    todo 用户搜索-->
    <van-list
        v-model:loading="listLoading"
        :finished="listFinished"
        offset="0"
        @load="likeLoad"
        style="margin: 15px;height: 100%"
    >
      <template #finished>
        <span v-if="likeList.length !== 0">没有更多了</span>
      </template>
      <template #loading>
        <van-loading vertical>
          <template #icon>
            <van-icon name="star-o" size="30"/>
          </template>
          加载中...
        </van-loading>
      </template>
      <user-like-list :like-list="likeList"/>
    </van-list>
    <van-back-top right="20px" bottom="60px"/>
    <van-empty
        v-if="(!likeList || likeList.length===0) && listLoading===false"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
        image-size="80"
        description="您还没有收到过赞"
    />
  </van-pull-refresh>
</template>

<script setup lang="ts">
import { ref } from "vue";
import myAxios from "../../plugins/my-axios";
import UserLikeList from "../../components/UserLikeList.vue";

interface Like {
  id: number;
  userId: number;
  blogId: number;
  createTime: string;
  // 根据实际点赞对象添加其他属性
}

// 响应式状态定义
const loading = ref<boolean>(true);
const likeList = ref<Like[]>([]);
const refreshLoading = ref<boolean>(false);
const listLoading = ref<boolean>(false);
const listFinished = ref<boolean>(false);
const likeCurrentPage = ref<number>(0);

// 获取点赞列表
const getLikes = async (currentPage: number): Promise<void> => {
  try {
    const res = await myAxios.get("/message/like", {
      params: { currentPage }
    });

    if (res?.data.code === 0) {
      if (res.data.data.records.length > 0) {
        res.data.data.records.forEach((item: Like) => likeList.value.push(item));
      } else {
        listFinished.value = true;
      }
      listLoading.value = false;
    }
  } catch (error) {
    console.error('Failed to fetch likes:', error);
    listLoading.value = false;
  }
};

// 加载更多点赞
const likeLoad = async (): Promise<void> => {
  likeCurrentPage.value++;
  await getLikes(likeCurrentPage.value);
};

// 重新加载点赞列表
const likeReload = async (): Promise<void> => {
  try {
    likeCurrentPage.value = 1;
    likeList.value = [];
    listFinished.value = false;
    await getLikes(likeCurrentPage.value);
  } catch (error) {
    console.error('Failed to reload likes:', error);
  } finally {
    refreshLoading.value = false;
    listLoading.value = false;
  }
};
</script>

<style scoped>

</style>

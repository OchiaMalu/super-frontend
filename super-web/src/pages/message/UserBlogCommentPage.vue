<template>
    <van-sticky>
        <van-nav-bar
            left-arrow
            @click-left="onClickLeft"
        >
            <template #title>
                <van-tabs v-model:active="active" @change="changeTab">
                    <van-tab title="评论我的" />
                    <van-tab title="我评论的" />
                </van-tabs>
            </template>
        </van-nav-bar>
    </van-sticky>
    <van-pull-refresh
        v-model="refreshLoading"
        success-text="刷新成功"
        @refresh="commentReload">
        <!--    todo 用户搜索-->
        <van-list
            v-model:loading="listLoading"
            :finished="listFinished"
            offset="0"
            @load="commentLoad"
            style="margin: 15px;height: 100%"
        >
            <template #finished>
                <span v-if="commentList.length !== 0">没有更多了</span>
            </template>
            <template #loading>
                <van-loading vertical>
                    <template #icon>
                        <van-icon name="star-o" size="30" />
                    </template>
                    加载中...
                </van-loading>
            </template>
            <user-comment-list :comment-list="commentList" @refresh="refreshComments" />
        </van-list>
        <van-back-top right="20px" bottom="60px" />
        <van-empty
            v-if="(!commentList || commentList.length===0) && listLoading===false &&active===1"
            image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
            image-size="80"
            description="您还没有写过评论"
        />
        <van-empty
            v-if="(!commentList || commentList.length===0) && active===0"
            image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
            image-size="80"
            description="您还没有被评论过"
        />
    </van-pull-refresh>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import myAxios from "../../plugins/my-axios";

interface Comment {
  id: number;
  content: string;
  // 根据实际评论对象添加其他属性
}

// 响应式状态定义
const active = ref<number>(0);
const loading = ref<boolean>(true);
const commentList = ref<Comment[]>([]);
const refreshLoading = ref<boolean>(false);
const listLoading = ref<boolean>(false);
const listFinished = ref<boolean>(false);
const commentCurrentPage = ref<number>(0);

const router = useRouter();

// 获取评论列表
const getComments = async (currentPage: number): Promise<void> => {
  try {
    const res = await myAxios.get("/comments/list/my", {
      params: { currentPage }
    });

    if (res?.data.code === 0) {
      if (res.data.data.records.length > 0) {
        res.data.data.records.forEach((item: Comment) => commentList.value.push(item));
      } else {
        listFinished.value = true;
      }
      listLoading.value = false;
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    listLoading.value = false;
  }
};

// 加载评论
const commentLoad = async (): Promise<void> => {
  if (active.value === 1) {
    commentCurrentPage.value++;
    await getComments(commentCurrentPage.value);
  } else {
    commentList.value = [];
    try {
      const res = await myAxios.get("/comments/list/commented");
      if (res.data.code === 0) {
        commentList.value = res.data.data;
      }
      listFinished.value = true;
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }
};

// 重新加载评论
const commentReload = async (): Promise<void> => {
  try {
    if (active.value === 0) {
      commentList.value = [];
      const res = await myAxios.get("/comments/list/commented");
      if (res.data.code === 0) {
        commentList.value = res.data.data;
      }
    } else {
      commentCurrentPage.value = 1;
      commentList.value = [];
      listFinished.value = false;
      await getComments(commentCurrentPage.value);
    }
  } catch (error) {
    console.error('Failed to reload comments:', error);
  } finally {
    refreshLoading.value = false;
    listLoading.value = false;
  }
};

// Tab 切换处理
const changeTab = async (index: number): Promise<void> => {
  await commentReload();
};

// 刷新评论
const refreshComments = async (): Promise<void> => {
  await commentReload();
};

// 导航处理
const onClickLeft = (): void => {
  router.push("/message");
};

// 生命周期钩子
onMounted(async () => {
  try {
    const res = await myAxios.get("/comments/list/commented");
    if (res.data.code === 0) {
      commentList.value = res.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch initial comments:', error);
  } finally {
    refreshLoading.value = false;
    listLoading.value = false;
  }
});
</script>

<style scoped>
:deep(.van-tab) {
  margin-left: 10px;
}
</style>

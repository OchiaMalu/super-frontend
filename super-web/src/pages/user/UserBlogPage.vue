<template>
    <van-pull-refresh
            v-model="refreshLoading"
            success-text="刷新成功"
            @refresh="onRefresh"
    >
        <van-list
            style="margin: 15px"
                v-model:loading="listLoading"
                :finished="listFinished"
                offset="0"
                finished-text="没有更多了"
                @load="onLoad"
        >
            <template #loading>
                <van-skeleton>
                    <template #template>
                        <div style="display: flex;width: 100%;margin: 15px">
                            <div :style="{ flex: 1, marginLeft: '16px' }">
                                <van-skeleton-paragraph row-width="60%"/>
                                <van-skeleton-paragraph row-width="60%"/>
                            </div>
                            <van-skeleton-image/>
                        </div>
                    </template>
                </van-skeleton>
            </template>
            <blog-card-list :blog-list="blogList"/>
        </van-list>
    </van-pull-refresh>
    <van-empty v-if="blogList?.length<1 && !listLoading" description="数据为空"/>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showFailToast } from "vant";
import myAxios from "../../plugins/my-axios";
import BlogCardList from "../../components/BlogCardList.vue";

interface Blog {
  id: number;
  title: string;
  content: string;
  userId: number;
  commentsNum: number;
  likedNum: number;
  isLike: boolean;
  createTime?: string;
  updateTime?: string;
  // 根据实际博客对象添加其他属性
}

// 响应式状态定义
const router = useRouter();
const refreshLoading = ref<boolean>(false);
const listLoading = ref<boolean>(false);
const listFinished = ref<boolean>(false);
const currentPage = ref<number>(0);
const blogList = ref<Blog[]>([]);

// 加载博客列表
const listBlogs = async (currentPage: number): Promise<void> => {
  try {
    listLoading.value = true;
    const res = await myAxios.get(`/blog/list/my/blog?currentPage=${currentPage}`);
    
    if (res?.data.code === 0) {
      if (res.data.data.records.length === 0) {
        listFinished.value = true;
        return;
      }
      res.data.data.records.forEach((blog: Blog) => blogList.value.push(blog));
    } else {
      showFailToast("博文加载失败，请稍后重试");
    }
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    showFailToast("加载失败，请稍后重试");
  } finally {
    listLoading.value = false;
  }
};

// 加载更多
const onLoad = async (): Promise<void> => {
  currentPage.value++;
  await listBlogs(currentPage.value);
};

// 刷新处理
const onRefresh = async (): Promise<void> => {
  try {
    blogList.value = [];
    listFinished.value = false;
    currentPage.value = 1;
    await listBlogs(currentPage.value);
  } catch (error) {
    console.error('Failed to refresh blogs:', error);
  } finally {
    refreshLoading.value = false;
  }
};
</script>

<style scoped>

</style>

<template>
    <van-empty
        v-if="(!blogList.length) && !loading"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
        image-size="80"
        description="您关注的用户没有更新"
    />
    <van-loading vertical v-if="loading">
        <template #icon>
            <van-icon name="star-o" size="30"/>
        </template>
        加载中...
    </van-loading>
    <blog-card-list v-if="blogList.length>0" :blog-list="blogList"/>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
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
const loading = ref<boolean>(true);
const blogList = ref<Blog[]>([]);

// 生命周期钩子
onMounted(async () => {
  try {
    const res = await myAxios.get("/message/blog");
    if (res?.data.code === 0) {
      blogList.value = res.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch blog list:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>

</style>

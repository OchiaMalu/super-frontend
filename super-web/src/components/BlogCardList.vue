<template>
    <van-cell-group>
        <van-cell
            v-for="blog in props.blogList"
            :key="blog.id"
            :title="blog.title"
            @click="toBlog(blog.id)">
            <template #right-icon>
                <van-image v-if="blog.coverImage" :src="blog.coverImage" width="88px" height="88px" />
            </template>
            <template #title>
                <van-text-ellipsis style="margin-left: 20px" :content="blog.title" rows="1" />
            </template>
            <template #value>
                <div style="margin-top: 60px;margin-right: 10px">
                    <van-icon name="envelop-o" size="14" style="margin-right: 5px">
                        <span style="margin-left: 2px">{{ blog.commentsNum }}</span>
                    </van-icon>
                    <van-icon
                        :name="blog.isLike ? 'good-job' : 'good-job-o'"
                        :color="blog.isLike ? 'red' : undefined"
                        size="14"
                        :style="blog.isLike ? 'margin-right: 2px' : ''"
                    >
                        <span style="margin-left: 2px">{{ blog.likedNum }}</span>
                    </van-icon>
                </div>
            </template>
            <template #label>
                <span style="margin-left: 20px">{{ blog.createTime }}</span>
            </template>
        </van-cell>
    </van-cell-group>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { showFailToast } from "vant";
import { getCurrentUser } from "../services/user";
import { BlogType } from "../models/blog";

interface BlogCardListProps {
    blogList: BlogType[];
}

const props = defineProps<BlogCardListProps>();
const router = useRouter();

// 博客导航
const toBlog = async (blogId: number): Promise<void> => {
    try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
            await router.push({
                path: "/blog",
                query: {
                    id: blogId,
                },
            });
        } else {
            showFailToast("未登录");
            await router.replace("/user/login");
        }
    } catch (error) {
        console.error("Failed to navigate to blog:", error);
        showFailToast("导航失败，请稍后重试");
    }
};
</script>

<style scoped>
:deep(.van-cell__label) {
    margin-top: 38px;
}

:deep(.van-cell) {
    padding-left: 0;
    padding-right: 0;
}
</style>

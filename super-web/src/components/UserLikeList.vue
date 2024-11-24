<template>
    <van-cell-group v-for="like in props.likeList" :key="like.id" :border="false">
        <div v-if="like.type === 0">
            <van-cell center :border="false" :title="like.fromUser.username"
                      :label="`${like.createTime} 赞了我的博文`">
                <template #icon>
                    <van-image
                        round
                        width="40"
                        height="40"
                        style="margin-right: 10px"
                        :src="like.fromUser.avatarUrl"
                    />
                </template>
            </van-cell>
            <div>
                <van-space style="background: #f3f2f5;width: 100%;margin: 0" align="center"
                           @click="like.blog?.id && toBlog(like.blog.id)">
                    <van-image v-if="like.blog?.coverImage" :src="like.blog.coverImage" width="50" height="50"
                               style="margin-left: 10px" />
                    <van-cell :title="like.blog?.author.username" :label="like.blog?.title"
                              style="background: #f3f2f5;margin: 0">
                    </van-cell>
                </van-space>
            </div>
        </div>

        <div v-if="like.type === 1">
            <van-cell center :border="false" :title="like.fromUser.username"
                      :label="`${like.createTime} 赞了我的评论`">
                <template #icon>
                    <van-image
                        round
                        width="40"
                        height="40"
                        style="margin-right: 10px"
                        :src="like.fromUser.avatarUrl"
                    />
                </template>
            </van-cell>
            <div>
                <van-space style="background: #f3f2f5;width: 100%"
                           @click="like.comment?.blogId && toBlog(like.comment.blogId)">
                    <span style="padding: 16px">{{ like.comment?.content }}</span>
                </van-space>
            </div>
        </div>
    </van-cell-group>

</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { showFailToast } from "vant";
import { getCurrentUser } from "../services/user";
import { MessageType } from "../types/message";

interface User {
    id: number;
    role: number;
    // 根据实际用户对象添加其他属性
}

interface Props {
    likeList: MessageType[];
}

// Props 和 Emits 定义
const props = defineProps<Props>();
const emits = defineEmits(["refresh"]);

// 响应式状态定义
const currentUser = ref<User | null>(null);
const router = useRouter();

// 导航到博客
const toBlog = (blogId: number): void => {
    router.push({
        path: "/blog",
        query: { id: blogId },
    });
};

// 生命周期钩子
onMounted(async () => {
    try {
        currentUser.value = await getCurrentUser();
    } catch (error) {
        console.error("Failed to get current user:", error);
        showFailToast("获取用户信息失败");
    }
});
</script>

<style scoped>

</style>

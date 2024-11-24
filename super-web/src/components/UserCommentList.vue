<template>
    <van-cell-group v-for="comment in props.commentList" :key="comment.id" :border="false">
        <van-cell center :border="false" :title="comment.commentUser.username"
                  :label="`${comment.createTime} 评论帖子`">
            <template #icon>
                <van-image
                    round
                    width="40"
                    height="40"
                    style="margin-right: 10px"
                    :src="comment.commentUser.avatarUrl"
                />
            </template>
            <template #value>
                <van-icon v-if="!comment.isLiked" name="good-job-o" size="15" @click="likeComment(comment)">
                    {{ comment.likedNum }}
                </van-icon>
                <van-icon v-else name="good-job-o" color="red" size="15" @click="likeComment(comment)">
                    {{ comment.likedNum }}
                </van-icon>
                <van-icon v-if="currentUser?.id === comment.commentUser.id || currentUser?.role === 1" name="delete-o"
                          size="15" style="margin-left: 10px" @click="deleteComment(comment.id)"/>
            </template>
        </van-cell>
        <div style="display: block;width: 80%;word-wrap: break-word;margin-left: 10px">
            {{ comment.content }}
        </div>
        <div>
            <van-space style="background: #f3f2f5;width: 100%;margin: 0" align="center"
                       @click="comment.blog?.id && toBlog(comment.blog.id)">
                <van-image v-if="comment.blog?.coverImage" :src="comment.blog.coverImage" width="50" height="50"
                           style="margin-left: 10px"/>
                <van-cell :title="comment.blog?.author.username" :label="comment.blog?.title"
                          style="background: #f3f2f5;margin: 0">
                </van-cell>
            </van-space>
        </div>
    </van-cell-group>

</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showFailToast } from "vant";
import myAxios from "../plugins/my-axios";
import { getCurrentUser } from "../services/user";
import { CommentType } from "../types/comment";

interface User {
    id: number;
    role: number;
    // 根据实际用户对象添加其他属性
}

interface Props {
    commentList: CommentType[];
}

// Props 和 Emits 定义
const props = defineProps<Props>();
const emits = defineEmits(['refresh']);

// 响应式状态定义
const currentUser = ref<User | null>(null);
const router = useRouter();

// 点赞评论
const likeComment = async (comment: CommentType): Promise<void> => {
    try {
        const res = await myAxios.put(`/comments/like/${comment.id}`);
        if (res?.data.code === 0) {
            const res_ = await myAxios.get(`/comments/${comment.id}`);
            if (res_?.data.code === 0) {
                comment.likedNum = res_.data.data.likedNum;
                comment.isLiked = res_.data.data.isLiked;
            }
        }
    } catch (error) {
        console.error('Failed to like comment:', error);
        showFailToast("操作失败，请稍后重试");
    }
};

// 删除评论
const deleteComment = async (id: number): Promise<void> => {
    try {
        await showConfirmDialog({
            title: '确定要删除评论吗',
            message: '此操作无法撤回',
        });

        const res = await myAxios.delete(`/comments/${id}`);
        if (res?.data.code === 0) {
            emits("refresh");
        } else {
            showFailToast(`删除失败${res.data.description ? `,${res.data.description}` : ''}`);
        }
    } catch {
        // 用户取消删除操作
    }
};

// 导航到博客
const toBlog = (blogId: number): void => {
    router.push({
        path: "/blog",
        query: { id: blogId }
    });
};

// 生命周期钩子
onMounted(async () => {
    try {
        currentUser.value = await getCurrentUser();
    } catch (error) {
        console.error('Failed to get current user:', error);
        showFailToast("获取用户信息失败");
    }
});
</script>

<style scoped>

</style>
